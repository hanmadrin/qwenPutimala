'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { requestCustomerOTP, verifyCustomerOTP } from '@/lib/api';
import { useCustomerAuth } from '@/lib/hooks';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useCustomerAuth();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const phoneRegex = /^(\+8801|8801|01)[3-9]\d{8}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        throw new Error('Please enter a valid Bangladesh phone number');
      }

      await requestCustomerOTP(phone);
      setMessage('OTP sent successfully! Please check your mobile.');
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (otp.length !== 6) {
        throw new Error('OTP must be 6 digits');
      }

      const data = await verifyCustomerOTP(phone, otp);
      login(data.token, data.customer);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await requestCustomerOTP(phone);
      setMessage('OTP resent successfully!');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'phone' ? 'Customer Login' : 'Enter OTP'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {step === 'phone'
              ? 'Enter your mobile number to receive a login OTP'
              : `Enter the 6-digit OTP sent to ${phone}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-600">
            {message}
          </div>
        )}

        {step === 'phone' && (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXX XXXXXX"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Format: 01XXX XXXXXX (Bangladesh numbers only)
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary-600 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="XXXXXX"
                required
                autoFocus
                className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-lg tracking-widest focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary-600 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className="text-sm text-primary-600 hover:underline disabled:cursor-not-allowed"
              >
                Resend OTP
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                  setMessage('');
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                Change Number
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 border-t pt-6 text-center text-sm text-gray-600">
          <p>
            By logging in, you agree to our{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
