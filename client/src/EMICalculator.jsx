import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Calendar, Percent, ArrowRight, Download, RefreshCcw } from 'lucide-react';
import * as XLSX from 'xlsx';

const EMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(10);
  const [emi, setEmi] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 12 / 100;
    const months = parseFloat(tenure) * 12;

    if (principal > 0 && rate > 0 && months > 0) {
      const emiValue = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
      const totalPayable = emiValue * months;
      const totalInt = totalPayable - principal;

      setEmi(emiValue.toFixed(2));
      setTotalInterest(totalInt.toFixed(2));
      setTotalPayment(totalPayable.toFixed(2));
    }
  };

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, tenure]);

  const downloadRepaymentSchedule = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 12 / 100;
    const months = parseFloat(tenure) * 12;
    const emiValue = parseFloat(emi);

    let schedule = [];
    let remainingBalance = principal;

    for (let i = 1; i <= months; i++) {
      const interestForMonth = remainingBalance * rate;
      const principalForMonth = emiValue - interestForMonth;
      remainingBalance -= principalForMonth;

      schedule.push({
        "Month": i,
        "Opening Balance": (remainingBalance + principalForMonth).toFixed(2),
        "EMI": emiValue.toFixed(2),
        "Interest Paid": interestForMonth.toFixed(2),
        "Principal Paid": principalForMonth.toFixed(2),
        "Closing Balance": Math.max(0, remainingBalance).toFixed(2)
      });
    }

    const ws = XLSX.utils.json_to_sheet(schedule);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Repayment Schedule");
    XLSX.writeFile(wb, `Repayment_Schedule_${loanAmount}.xlsx`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="emi-calculator-container" style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      color: '#1e293b'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem', letterSpacing: '-1px' }}>
          EMI <span className="highlight" style={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Calculator</span>
        </h1>
        <p style={{ opacity: 0.6, fontSize: '1.2rem', fontWeight: '500' }}>Precision financial planning with real-time analytics</p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start'
      }}>
        {/* Input Section */}
        <div className="results-card" style={{ 
          padding: '2.5rem', 
          borderRadius: '32px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <label style={{ fontWeight: '700', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Principal Amount
              </label>
              <span style={{ color: '#059669', fontWeight: '800', fontSize: '1.2rem' }}>{formatCurrency(loanAmount)}</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: '1.5rem', fontWeight: '700', color: '#94a3b8' }}>₹</span>
              <input 
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="pill-input"
                style={{ width: '100%', paddingLeft: '3rem', background: '#f8fafc', border: '2px solid transparent', transition: 'all 0.3s' }}
              />
            </div>
            <input 
              type="range" 
              min="100000" 
              max="10000000" 
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              style={{ width: '100%', accentColor: '#10b981', marginTop: '1.5rem' }}
            />
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <label style={{ fontWeight: '700', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Interest Rate (p.a)
              </label>
              <span style={{ color: '#059669', fontWeight: '800', fontSize: '1.2rem' }}>{interestRate}%</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
               <input 
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="pill-input"
                style={{ width: '100%', background: '#f8fafc', border: '2px solid transparent' }}
              />
              <span style={{ position: 'absolute', right: '1.5rem', fontWeight: '700', color: '#94a3b8' }}>%</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="20" 
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              style={{ width: '100%', accentColor: '#10b981', marginTop: '1.5rem' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <label style={{ fontWeight: '700', fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Tenure (Years)
              </label>
              <span style={{ color: '#059669', fontWeight: '800', fontSize: '1.2rem' }}>{tenure} Yrs</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type="number"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="pill-input"
                style={{ width: '100%', background: '#f8fafc', border: '2px solid transparent' }}
              />
              <span style={{ position: 'absolute', right: '1.5rem', fontWeight: '700', color: '#94a3b8' }}>Years</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="30" 
              step="1"
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              style={{ width: '100%', accentColor: '#10b981', marginTop: '1.5rem' }}
            />
          </div>
        </div>

        {/* Results Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="results-card" style={{ 
            padding: '3rem', 
            borderRadius: '40px', 
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '-20%', 
              right: '-10%', 
              width: '200px', 
              height: '200px', 
              background: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: '50%', 
              filter: 'blur(60px)' 
            }}></div>
            
            <h3 style={{ opacity: 0.5, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '1rem', fontWeight: '700' }}>Monthly Installment</h3>
            <div style={{ fontSize: '4.5rem', fontWeight: '950', color: '#10b981', lineHeight: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.5rem', opacity: 0.8 }}>₹</span>{new Intl.NumberFormat('en-IN').format(emi)}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="results-card" style={{ padding: '2rem', borderRadius: '28px', borderLeft: '6px solid #10b981' }}>
              <h4 style={{ opacity: 0.5, fontSize: '0.75rem', marginBottom: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Interest</h4>
              <p style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1e293b' }}>
                <span style={{ fontSize: '1.1rem', marginRight: '4px', opacity: 0.6 }}>₹</span>{new Intl.NumberFormat('en-IN').format(totalInterest)}
              </p>
            </div>
            <div className="results-card" style={{ padding: '2rem', borderRadius: '28px', borderLeft: '6px solid #334155' }}>
              <h4 style={{ opacity: 0.5, fontSize: '0.75rem', marginBottom: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Payable</h4>
              <p style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1e293b' }}>
                <span style={{ fontSize: '1.1rem', marginRight: '4px', opacity: 0.6 }}>₹</span>{new Intl.NumberFormat('en-IN').format(totalPayment)}
              </p>
            </div>
          </div>

          <button 
            className="download-btn" 
            onClick={downloadRepaymentSchedule}
            style={{ 
              width: '100%', 
              padding: '1.5rem',
              fontSize: '1.1rem',
              borderRadius: '24px',
              background: 'linear-gradient(90deg, #10b981, #059669)',
              boxShadow: '0 15px 30px rgba(16, 185, 129, 0.3)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '1rem' 
            }}
          >
             <Download size={22} /> Download Repayment Schedule
          </button>
        </div>
      </div>

      {/* Stats/Info Section */}
      <div style={{ 
        marginTop: '5rem', 
        padding: '3rem', 
        borderRadius: '32px', 
        background: 'linear-gradient(to right, rgba(255,255,255,0.8), rgba(248,250,252,0.5))', 
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0,0,0,0.03)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '3rem'
      }}>
        <div>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem', fontWeight: '800' }}>
            <RefreshCcw size={24} className="spin-hover" style={{ color: '#10b981' }} /> Financial Insights
          </h3>
          <p style={{ lineHeight: '1.8', opacity: 0.7, fontSize: '1.05rem', fontWeight: '500' }}>
            Our smart algorithm calculates your Equated Monthly Installment (EMI) based on the reducing balance method. 
            This provides a crystal-clear view of your debt obligations, helping you make informed decisions about your financial future.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
            <span style={{ fontWeight: '600', color: '#475569' }}>Principal: {Math.round((loanAmount / totalPayment) * 100)}% of total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#334155' }}></div>
            <span style={{ fontWeight: '600', color: '#475569' }}>Interest: {Math.round((totalInterest / totalPayment) * 100)}% of total</span>
          </div>
          <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
             <div style={{ width: `${(loanAmount / totalPayment) * 100}%`, background: '#10b981' }}></div>
             <div style={{ width: `${(totalInterest / totalPayment) * 100}%`, background: '#334155' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EMICalculator;
