import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoanCard } from '@/components/LoanCard';
import { useAuth } from '@/contexts/AuthContext';
import { dummyLoans, Loan } from '@/lib/api';
import { Search, Filter, TrendingUp, DollarSign, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [loans, setLoans] = useState<Loan[]>(dummyLoans);

  const handleFundLoan = (loanId: string, amount: number) => {
    setLoans(prevLoans => 
      prevLoans.map(loan => {
        if (loan.id === loanId) {
          const newFunding = loan.currentFunding + amount;
          const newStatus = newFunding >= loan.amount ? 'FUNDED' : 'FUNDING';
          
          return {
            ...loan,
            currentFunding: Math.min(newFunding, loan.amount),
            status: newStatus as any
          };
        }
        return loan;
      })
    );

    toast({
      title: "Investment Successful",
      description: `You've successfully invested $${amount.toLocaleString()} in this loan!`,
    });
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.borrower.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'pending' && loan.status === 'PENDING') ||
                         (filterBy === 'funding' && loan.status === 'FUNDING') ||
                         (filterBy === 'funded' && loan.status === 'FUNDED');
    
    return matchesSearch && matchesFilter;
  });

  const sortedLoans = [...filteredLoans].sort((a, b) => {
    switch (sortBy) {
      case 'amount-high':
        return b.amount - a.amount;
      case 'amount-low':
        return a.amount - b.amount;
      case 'trust-score':
        return b.borrower.trustScore - a.borrower.trustScore;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const stats = [
    {
      label: 'Total Available',
      value: `₹${loans.reduce((sum, loan) => sum + (loan.amount - loan.currentFunding), 0).toLocaleString()}`,
      icon: <DollarSign className="w-4 h-4" />,
      color: 'text-primary'
    },
    {
      label: 'Active Loans',
      value: loans.filter(loan => loan.status === 'FUNDING' || loan.status === 'PENDING').length.toString(),
      icon: <Target className="w-4 h-4" />,
      color: 'text-secondary'
    },
    {
      label: 'Avg. Return',
      value: '8.2%',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-success'
    },
    {
      label: 'Borrowers',
      value: new Set(loans.map(loan => loan.borrower.id)).size.toString(),
      icon: <Users className="w-4 h-4" />,
      color: 'text-accent'
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Loan Marketplace</h1>
          <p className="text-muted-foreground">
            {user?.role === 'LENDER' ? 
              'Discover investment opportunities and fund loans to earn returns' :
              'Browse available loans in our marketplace'
            }
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className={`${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gradient-card border-border/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filter & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search loans or borrowers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="amount-high">Highest Amount</SelectItem>
                  <SelectItem value="amount-low">Lowest Amount</SelectItem>
                  <SelectItem value="trust-score">Trust Score</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Loans</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="funding">Funding</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loans Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {sortedLoans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLoans.map((loan, index) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <LoanCard 
                  loan={loan} 
                  showFundButton={user?.role === 'LENDER'}
                  onFund={handleFundLoan}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No loans found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterBy('all');
                  setSortBy('newest');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Investment Tips for Lenders */}
      {user?.role === 'LENDER' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-gradient-success/10 border-success/20">
            <CardHeader>
              <CardTitle className="text-success">💡 Investment Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Diversify Your Portfolio</h4>
                  <p className="text-muted-foreground">
                    Spread your investments across multiple loans to reduce risk
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Check Trust Scores</h4>
                  <p className="text-muted-foreground">
                    Higher trust scores indicate more reliable borrowers
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Start Small</h4>
                  <p className="text-muted-foreground">
                    Begin with smaller investments to test the waters
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Read Loan Purposes</h4>
                  <p className="text-muted-foreground">
                    Understand what borrowers plan to use the money for
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Marketplace;