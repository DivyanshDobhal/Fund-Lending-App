import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();

// Create a new loan request
const createLoanRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, purpose, repaymentTerm } = req.body;

    const loanRequest = await prisma.loanRequest.create({
      data: {
        amount,
        purpose,
        repaymentTerm,
        borrowerId: req.user.id
      },
      include: {
        borrower: {
          select: {
            id: true,
            name: true,
            email: true,
            creditScore: true,
            trustScore: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Loan request created successfully',
      loanRequest
    });
  } catch (error) {
    console.error('Create loan request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all marketplace loans
const getMarketplaceLoans = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const whereClause = {
      status: status ? status : { in: ['PENDING', 'FUNDING'] }
    };

    const [loans, total] = await Promise.all([
      prisma.loanRequest.findMany({
        where: whereClause,
        include: {
          borrower: {
            select: {
              id: true,
              name: true,
              email: true,
              creditScore: true,
              trustScore: true
            }
          },
          fundings: {
            include: {
              lender: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.loanRequest.count({ where: whereClause })
    ]);

    res.json({
      loans,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get marketplace loans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single loan by ID
const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    const loan = await prisma.loanRequest.findUnique({
      where: { id },
      include: {
        borrower: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        fundings: {
          include: {
            lender: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        repayments: true
      }
    });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Get loan by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Fund a loan
const fundLoan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { amount } = req.body;

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get the loan request
      const loanRequest = await tx.loanRequest.findUnique({
        where: { id },
        include: {
          fundings: true
        }
      });

      if (!loanRequest) {
        throw new Error('Loan not found');
      }

      // Check if loan is still accepting funding
      if (!['PENDING', 'FUNDING'].includes(loanRequest.status)) {
        throw new Error('Loan is no longer accepting funding');
      }

      // Calculate remaining amount needed
      const remainingAmount = loanRequest.amount - loanRequest.amountFunded;
      
      if (amount > remainingAmount) {
        throw new Error(`Maximum funding amount is ${remainingAmount}`);
      }

      // Create funding record
      const funding = await tx.funding.create({
        data: {
          amount,
          lenderId: req.user.id,
          loanRequestId: id
        }
      });

      // Update loan request
      const newAmountFunded = loanRequest.amountFunded + amount;
      let newStatus = loanRequest.status;

      if (newAmountFunded >= loanRequest.amount) {
        newStatus = 'FUNDED';
      } else if (loanRequest.status === 'PENDING') {
        newStatus = 'FUNDING';
      }

      const updatedLoanRequest = await tx.loanRequest.update({
        where: { id },
        data: {
          amountFunded: newAmountFunded,
          status: newStatus
        },
        include: {
          borrower: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          fundings: {
            include: {
              lender: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      });

      return { funding, loanRequest: updatedLoanRequest };
    });

    res.json({
      message: 'Loan funded successfully',
      funding: result.funding,
      loanRequest: result.loanRequest
    });
  } catch (error) {
    console.error('Fund loan error:', error);
    if (error.message === 'Loan not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('Maximum funding amount') || 
        error.message === 'Loan is no longer accepting funding') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  createLoanRequest,
  getMarketplaceLoans,
  getLoanById,
  fundLoan
};
