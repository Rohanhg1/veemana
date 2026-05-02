// PITCH COMMENTS — WHO IS THE END USER:
// 1. CITIZEN: Ramu, MGNREGA worker in Barmer. Wants to know if his
//    ₹2800 wage was released or pocketed by the sarpanch.
//    He uses the Verify page. No wallet, no login, just his village name.
//
// 2. AUDITOR: IAS officer doing Karnataka district audit.
//    Needs court-admissible tamper-proof evidence.
//    Uses Flag & Report. IPFS hash cannot be deleted before court date.
//
// 3. ADMIN: Ministry official releasing ₹41 crore to Karnataka districts.
//    Their MetaMask wallet signs every transaction.
//    3 signatures required — single corruption mathematically impossible.
//
// PITCH COMMENTS — WHY METAMASK / WALLET:
// MetaMask is a digital identity for government officials.
// Like a digital fingerprint on every fund approval.
// The blockchain records WHO approved WHAT and WHEN — permanently.
// No official can later claim "I didn't approve that transfer."
//
// PITCH COMMENTS — SCALABILITY:
// Adding a new government scheme takes 2 hours.
// Add config entry + deploy contract module.
// No database migration, no central server update.
// Any state government can fork and deploy their own instance.

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TransactionProvider } from './context/TransactionContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VillageMap from './pages/VillageMap';
import Verify from './pages/Verify';
import Login from './pages/Login';
import FundRelease from './pages/FundRelease';
import AuditorReview from './pages/AuditorReview';
import FundLedger from './pages/FundLedger';
import AuditExport from './pages/AuditExport';
import FlagReport from './pages/FlagReport';

/*
THE DEMO SCRIPT:
// DEMO STEP 1: Login as Admin → Connect MetaMask
// DEMO STEP 2: Click "Demo: Inject Suspicious Transaction"
//              Form auto-fills with scam transaction
// DEMO STEP 3: Show AI pre-scan → 3 red warnings appear
// DEMO STEP 4: Click "Release Funds" → MetaMask opens → Confirm
// DEMO STEP 5: Show TX hash → click Etherscan link → 
//              show judges REAL transaction on blockchain
// DEMO STEP 6: Switch to Auditor login
//              Suspicious transaction appears highlighted red
//              AI score shows 87/100
// DEMO STEP 7: Click "Flag as Suspicious" → MetaMask → Confirm
//              Status changes to FROZEN instantly
// DEMO STEP 8: Switch to Citizen portal
//              Search "Madhubani"
//              Shows FUNDS FROZEN — AUDIT IN PROGRESS
//              With blockchain proof and Etherscan link
// DEMO STEP 9: Go back to Etherscan
//              Show BOTH transactions recorded permanently
//              "No government official can delete this"
*/

function AppRoutes() {
  const { userRole } = useAuth();

  if (!userRole) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ledger" element={<FundLedger />} />
        <Route path="/map" element={<VillageMap />} />
        <Route path="/admin/release" element={userRole === 'admin' ? <FundRelease /> : <Navigate to="/" />} />
        <Route path="/auditor/review" element={userRole === 'auditor' ? <AuditorReview /> : <Navigate to="/" />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/export" element={<AuditExport />} />
        <Route path="/report" element={<FlagReport />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <AppRoutes />
        </Router>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
