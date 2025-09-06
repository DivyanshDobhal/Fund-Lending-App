import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrustScoreBadge } from './TrustScoreBadge';
import { CreditScoreBadge } from './CreditScoreBadge';
import { ProgressBar } from './ProgressBar';
import { FundLoanModal } from './FundLoanModal';
import { Loan } from '@/lib/api';
import { Calendar, User, Target, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoanCardProps {
  loan: Loan;
  showFundButton?: boolean;
  onFund?: (loanId: string, amount: number) => void;
  className?: string;
}

export const LoanCard: React.FC<LoanCardProps> = ({ 
  loan, 
  showFundButton = false, 
  onFund,
  className = '' 
}) => {
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-muted text-muted-foreground';
      case 'FUNDING':
        return 'bg-primary/10 text-primary';
      case 'FUNDED':
        return 'bg-success/10 text-success';
      case 'REPAID':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const remainingAmount = loan.amount - loan.currentFunding;
  const isFullyFunded = loan.currentFunding >= loan.amount;

  const handleFund = (amount: number) => {
    if (onFund) {
      onFund(loan.id, amount);
    }
    setIsFundModalOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -4 }}
        className={className}
      >
        <Card className="h-full bg-gradient-card border-border/50 hover:shadow-elevated transition-all duration-300">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg font-semibold text-foreground line-clamp-1">
                {loan.purpose}
              </CardTitle>
              <Badge className={`${getStatusColor(loan.status)} text-xs`}>
                {loan.status}
              </Badge>
            </div>

            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="text-sm">{loan.borrower.name}</span>
              <TrustScoreBadge score={loan.borrower.trustScore} size="sm" />
              {loan.borrower.creditScore && (
                <CreditScoreBadge score={loan.borrower.creditScore} size="sm" />
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Loan Amount */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Target className="w-4 h-4" />
                <span className="text-sm">Loan Amount</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(loan.amount)}
              </span>
            </div>

            {/* Repayment Term */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Term</span>
              </div>
              <span className="text-sm font-medium">
                {loan.repaymentTerm} months
              </span>
            </div>

            {/* Progress Bar */}
            {loan.status !== 'PENDING' && (
              <div className="space-y-2">
                <ProgressBar 
                  current={loan.currentFunding} 
                  target={loan.amount}
                  animated={true}
                />
              </div>
            )}

            {/* Created Date */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
              <Calendar className="w-3 h-3" />
              <span>
                Created {new Date(loan.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Fund Button */}
            {showFundButton && !isFullyFunded && loan.status !== 'REPAID' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button 
                  onClick={() => setIsFundModalOpen(true)}
                  className="w-full mt-4 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  size="lg"
                >
                  Fund This Loan
                  {remainingAmount > 0 && (
                    <span className="ml-2 text-sm opacity-90">
                      ({formatCurrency(remainingAmount)} remaining)
                    </span>
                  )}
                </Button>
              </motion.div>
            )}

            {isFullyFunded && loan.status === 'FUNDED' && (
              <div className="text-center py-2">
                <Badge className="trust-high">
                  ✓ Fully Funded
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Fund Modal */}
      <FundLoanModal
        loan={loan}
        isOpen={isFundModalOpen}
        onClose={() => setIsFundModalOpen(false)}
        onFund={handleFund}
        remainingAmount={remainingAmount}
      />
    </>
  );
};