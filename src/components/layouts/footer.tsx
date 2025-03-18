'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function Footer() {
  const { data, isLoading, error } = trpc.methods.getMethods.useQuery();
  const paymentMethods = data?.data || [];

  // Create a duplicate array for infinite scrolling effect
  const duplicatedMethods = [...paymentMethods, ...paymentMethods];

  // Reference for the container width
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <footer className="pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Vazzuniverse</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted platform for game credits, diamonds, and
              subscriptions.
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Games Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Games</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Mobile Legends
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  PUBG Mobile
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Free Fire
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Genshin Impact
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Valorant
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Call of Duty Mobile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  How to Top Up
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Get Updates</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Subscribe to our newsletter for exclusive deals and game updates.
            </p>
            <form className="space-y-3">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
              />
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        {/* Payment Methods - Continuous Framer Motion Slider */}
        <div className="mt-12">
          <Separator className="mb-8 bg-gray-700" />
          <div className="space-y-6">
            <div className="relative overflow-hidden py-2" ref={containerRef}>
              {isLoading ? (
                <div className="text-gray-400 py-4">
                  Loading payment methods...
                </div>
              ) : error ? (
                <div className="text-red-400 py-4">
                  Error loading payment methods
                </div>
              ) : (
                <motion.div
                  className="flex gap-10"
                  animate={{
                    x: [0, -1500],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: 'loop',
                    duration: 20,
                    ease: 'linear',
                  }}
                >
                  {/* First set of payment methods */}
                  {duplicatedMethods.length > 0 ? (
                    duplicatedMethods.map((method, index) => (
                      <div
                        key={`${method.id}-${index}`}
                        className="flex flex-col items-center min-w-[100px]"
                      >
                        <div className="h-12 w-20 flex items-center justify-center">
                          <Image
                            width={80}
                            height={48}
                            src={method.images}
                            alt={method.name}
                            className="h-auto w-auto max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback payment methods if no data
                    <>
                      {[
                        { id: 'visa', name: 'Visa' },
                        { id: 'mastercard', name: 'Mastercard' },
                        { id: 'paypal', name: 'PayPal' },
                        { id: 'googlepay', name: 'Google Pay' },
                        { id: 'applepay', name: 'Apple Pay' },
                        { id: 'crypto', name: 'Cryptocurrency' },
                        { id: 'banktransfer', name: 'Bank Transfer' },
                        // Duplicate for continuous effect
                        { id: 'visa-2', name: 'Visa' },
                        { id: 'mastercard-2', name: 'Mastercard' },
                        { id: 'paypal-2', name: 'PayPal' },
                        { id: 'googlepay-2', name: 'Google Pay' },
                        { id: 'applepay-2', name: 'Apple Pay' },
                        { id: 'crypto-2', name: 'Cryptocurrency' },
                        { id: 'banktransfer-2', name: 'Bank Transfer' },
                      ].map((method) => (
                        <div
                          key={method.id}
                          className="flex flex-col items-center min-w-[100px]"
                        >
                          <div className="h-12 w-20 flex items-center justify-center">
                            <Image
                              width={80}
                              height={48}
                              src="/placeholder.svg?height=48&width=80"
                              alt={method.name}
                              className="h-auto max-h-full object-contain"
                            />
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12">
          <Separator className="mb-6 bg-gray-700" />
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Vazzuniverse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
