'use client';

import { trpc } from '@/utils/trpc';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function BannerSlider() {
  const bannerQuery = trpc.main.getBanners.useQuery();
  const { data: flashSaleItems } = trpc.layanans.flashsale.useQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const flashSaleRef = useRef<HTMLDivElement>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const regularBanners = bannerQuery.data?.data || [];

  // Handle banner navigation
  const handleNext = () => {
    setAutoplay(false);
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === regularBanners.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setAutoplay(false);
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? regularBanners.length - 1 : prevIndex - 1
    );
  };

  // Autoplay for banner slider
  useEffect(() => {
    if (!autoplay || !regularBanners.length || isHovering) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) =>
        prevIndex === regularBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [autoplay, regularBanners.length, isHovering]);

  // Reset autoplay after user interaction
  useEffect(() => {
    if (autoplay) return;

    const timeout = setTimeout(() => {
      setAutoplay(true);
    }, 10000);

    return () => clearTimeout(timeout);
  }, [autoplay]);

  // Calculate the end date for the flash sale
  useEffect(() => {
    if (!flashSaleItems || !flashSaleItems.length) return;

    // Find the first item with an expiredFlashSale date
    const flashSaleItem = flashSaleItems.find((item) => item.expiredFlashSale);

    if (!flashSaleItem || !flashSaleItem.expiredFlashSale) {
      // Fallback to fixed time if no expiredFlashSale found
      setTimeLeft({
        days: 0,
        hours: 5,
        minutes: 30,
        seconds: 0,
      });
      return;
    }

    // Calculate the time left based on expiredFlashSale
    const updateTimer = () => {
      const now = new Date();
      const endDate = new Date(flashSaleItem.expiredFlashSale);
      const timeDiff = endDate.getTime() - now.getTime();

      if (timeDiff <= 0) {
        // Flash sale has ended
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        });
        return;
      }

      // Calculate time units
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
      });
    };

    // Initial update
    updateTimer();

    // Set interval to update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [flashSaleItems]);

  // Scroll flash sale items horizontally
  const scrollFlashSale = (direction: 'left' | 'right') => {
    if (flashSaleRef.current) {
      const scrollAmount = 300;
      flashSaleRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Animation variants for banner slider
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Calculate discount percentage
  const calculateDiscount = (original: number, sale: number) => {
    if (!original || !sale) return 0;
    return Math.round(((original - sale) / original) * 100);
  };

  // Format time with leading zeros
  const formatTime = (value: number) => {
    return value.toString().padStart(2, '0');
  };

  return (
    <div className="space-y-12">
      {/* Main Banner Slider */}
      {regularBanners.length > 0 && (
        <div className="relative w-full overflow-hidden rounded-xl">
          <div
            className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Banner Images */}
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="absolute w-full h-full"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={
                      regularBanners[currentIndex]?.path || '/placeholder.svg'
                    }
                    alt={`Banner ${currentIndex + 1}`}
                    fill
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50"
                onClick={handlePrev}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full bg-black/30 text-white hover:bg-black/50"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-0 right-0">
              <div className="flex justify-center gap-2">
                {regularBanners.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentIndex === index ? 'w-6 bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => {
                      setCurrentIndex(index);
                      setAutoplay(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flash Sale Section */}
      {flashSaleItems &&
        Array.isArray(flashSaleItems) &&
        flashSaleItems.length > 0 && (
          <div className="container max-w-7xl">
            {/* Redesigned Flash Sale Header with Orange Theme */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-4 md:mb-0">
                  {/* Improved FLASH SALE sign with orange theme */}
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-lg blur-md opacity-75 animate-pulse"></div>
                    <div className="relative bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-4 rounded-lg flex items-center shadow-lg">
                      <Zap
                        className="h-7 w-7 mr-3 text-yellow-300 animate-pulse"
                        strokeWidth={2.5}
                      />
                      <span className="text-2xl font-extrabold tracking-wider">
                        FLASH SALE
                      </span>
                    </div>
                  </div>

                  {/* Highly Stylized Premium Countdown Timer */}
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-30"></div>
                    <div className="relative bg-gradient-to-b from-gray-900 to-gray-800 p-4 rounded-xl shadow-2xl border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-orange-500" />
                        <span className="text-orange-500 font-medium text-sm">
                          BERAKHIR DALAM
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {timeLeft.days > 0 && (
                          <div className="flex flex-col items-center">
                            <div className="bg-gradient-to-b from-orange-500 to-red-600 text-white px-3 py-2 rounded-lg font-mono font-bold text-xl shadow-inner flex items-center justify-center min-w-12">
                              {formatTime(timeLeft.days)}
                            </div>
                            <span className="text-xs text-gray-400 mt-1 font-medium">
                              HARI
                            </span>
                          </div>
                        )}

                        {timeLeft.days > 0 && (
                          <div className="text-orange-500 font-bold text-xl">
                            :
                          </div>
                        )}

                        <div className="flex flex-col items-center">
                          <div className="bg-gradient-to-b from-orange-500 to-red-600 text-white px-3 py-2 rounded-lg font-mono font-bold text-xl shadow-inner flex items-center justify-center min-w-12">
                            {formatTime(timeLeft.hours)}
                          </div>
                          <span className="text-xs text-gray-400 mt-1 font-medium">
                            JAM
                          </span>
                        </div>

                        <div className="text-orange-500 font-bold text-xl">
                          :
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="bg-gradient-to-b from-orange-500 to-red-600 text-white px-3 py-2 rounded-lg font-mono font-bold text-xl shadow-inner flex items-center justify-center min-w-12">
                            {formatTime(timeLeft.minutes)}
                          </div>
                          <span className="text-xs text-gray-400 mt-1 font-medium">
                            MENIT
                          </span>
                        </div>

                        <div className="text-orange-500 font-bold text-xl">
                          :
                        </div>

                        <div className="flex flex-col items-center">
                          <div className="bg-gradient-to-b from-orange-500 to-red-600 text-white px-3 py-2 rounded-lg font-mono font-bold text-xl shadow-inner flex items-center justify-center min-w-12">
                            {formatTime(timeLeft.seconds)}
                          </div>
                          <span className="text-xs text-gray-400 mt-1 font-medium">
                            DETIK
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                    onClick={() => scrollFlashSale('left')}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                    onClick={() => scrollFlashSale('right')}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Horizontal Scrollable Flash Sale Items */}
            <div
              ref={flashSaleRef}
              className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {flashSaleItems.map((item) => {
                const discountPercentage = calculateDiscount(
                  item.harga,
                  item.hargaFlashSale || 0
                );

                return (
                  <div
                    key={item.id}
                    className="min-w-[280px] max-w-[280px] group snap-start relative"
                  >
                    {/* Card with shadow and glow effect - updated colors */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-300"></div>

                    <div className="relative rounded-xl overflow-hidden shadow-xl">
                      {/* Image section with overlay */}
                      <div className="relative h-44 overflow-hidden">
                        {item.bannerFlashSale ? (
                          <Image
                            src={item.bannerFlashSale || '/placeholder.svg'}
                            alt={item.layanan}
                            width={300}
                            height={180}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                          />
                        ) : item.category?.thumbnail ? (
                          <Image
                            src={item.category.thumbnail || '/placeholder.svg'}
                            alt={item.category?.name || item.layanan}
                            width={300}
                            height={180}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-amber-500">
                            <span className="text-white font-bold text-lg">
                              {item.layanan}
                            </span>
                          </div>
                        )}

                        {/* Overlay with category */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
                          <div className="p-4 w-full">
                            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full">
                              {item.category?.name || 'Promo'}
                            </span>
                          </div>
                        </div>

                        {/* Discount badge - updated style */}
                        {discountPercentage > 0 && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-1 px-3 rounded-bl-lg rounded-tr-lg shadow-lg">
                              {discountPercentage}%
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content section */}
                      <div className="p-4">
                        <h3 className="font-semibold text-base line-clamp-1 mb-2">
                          {item.layanan}
                        </h3>

                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                            Rp{' '}
                            {(item.hargaFlashSale || 0).toLocaleString('id-ID')}
                          </span>
                          <span className="text-xs text-muted-foreground line-through">
                            Rp {item.harga.toLocaleString('id-ID')}
                          </span>
                        </div>

                        <Link href={`/order/${item.category.kode}`}>
                          <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-lg transition-all duration-300 transform group-hover:scale-105 shadow-md">
                            Beli Sekarang
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  );
}
