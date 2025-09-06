import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoanCard } from '@/components/LoanCard';
import { useAuth } from '@/contexts/AuthContext';
import { dummyLoans, Loan } from '@/lib/api';
import { Plus, DollarSign, Clock, Target, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

const BorrowerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isCreatingLoan, setIsCreatingLoan] = useState(false);
  const [loanForm, setLoanForm] = useState({
    amount: '',
    purpose: '',
    repaymentTerm: '12'
  });

  // Mock user loans (in real app, this would come from API)
  const userLoans: Loan[] = [
    {
      ...dummyLoans[0],
      borrower: { id: user?.id || '', name: user?.name || '', trustScore: 85, creditScore: 750 }
    },
    {
      id: '4',
      amount: 25000,
      purpose: 'Home Improvement',
      repaymentTerm: 8,
      currentFunding: 18000,
      status: 'FUNDING',
      borrower: { id: user?.id || '', name: user?.name || '', trustScore: 85, creditScore: 750 },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanForm.amount || !loanForm.purpose || !loanForm.repaymentTerm) return;

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Loan Request Created",
        description: "Your loan request has been submitted and is now live in the marketplace!",
      });
      
      setLoanForm({ amount: '', purpose: '', repaymentTerm: '12' });
      setIsCreatingLoan(false);
    }, 1000);
  };

  const stats = [
    {
      label: 'Total Borrowed',
      value: '₹7,500',
      icon: <DollarSign className="w-4 h-4" />,
      color: 'text-primary'
    },
    {
      label: 'Active Loans',
      value: '2',
      icon: <Target className="w-4 h-4" />,
      color: 'text-secondary'
    },
    {
      label: 'On Time Payments',
      value: '100%',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-success'
    },
    {
      label: 'Trust Score',
      value: '85',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'text-accent'
    },
    {
      label: 'Credit Score',
      value: '750',
      icon: <CreditCard className="w-4 h-4" />,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.name}</h1>
            <p className="text-muted-foreground">Manage your loans and track your financial progress</p>
          </div>
          
          <Button 
            onClick={() => setIsCreatingLoan(true)}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Request New Loan
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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

      {/* Create New Loan Form */}
      {isCreatingLoan && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-card border-border/50 shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create New Loan Request</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLoan} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Loan Amount</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="amount"
                        type="number"
                        value={loanForm.amount}
                        onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })}
                        placeholder="Enter loan amount"
                        min="2000"
                        max="100000"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="term">Repayment Term</Label>
                    <Select 
                      value={loanForm.repaymentTerm} 
                      onValueChange={(value) => setLoanForm({ ...loanForm, repaymentTerm: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 months</SelectItem>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="18">18 months</SelectItem>
                        <SelectItem value="24">24 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Loan Purpose</Label>
                  <Textarea
                    id="purpose"
                    value={loanForm.purpose}
                    onChange={(e) => setLoanForm({ ...loanForm, purpose: e.target.value })}
                    placeholder="Describe what you'll use this loan for..."
                    rows={3}
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreatingLoan(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-primary hover:shadow-glow"
                  >
                    Submit Loan Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* My Loan Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">My Loan Requests</h2>
        
        {userLoans.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userLoans.map((loan, index) => (
              <motion.div
                key={loan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <LoanCard loan={loan} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No loan requests yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first loan request to get started with borrowing
              </p>
              <Button 
                onClick={() => setIsCreatingLoan(true)}
                className="bg-gradient-primary hover:shadow-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Loan Request
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Repayment Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Payments</h2>
        
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No payments due</h3>
              <p className="text-muted-foreground">
                Your payment schedule will appear here once your loans are funded
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BorrowerDashboard;