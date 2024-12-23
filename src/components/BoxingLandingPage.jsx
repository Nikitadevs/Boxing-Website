// src/components/BoxingLandingPage.jsx

import React, { useState, lazy, Suspense, useEffect, useRef, useCallback } from 'react';
import { Link as ScrollLink, animateScroll as scroll } from 'react-scroll';
import {
  FaRunning,
  FaDumbbell,
  FaUserFriends,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
  FaPhone,
  FaArrowUp,
  FaMapMarkerAlt,
  FaTimes,
  FaBars, // Hamburger menu icon
  FaHome, // Home icon
  FaInfoCircle, // About icon
  FaEnvelopeSquare, // Join Now button icon
  FaVideo, // Video icon for About Us
  FaImages, // Images icon for About Us
  FaQuoteLeft, // Quote icon for Testimonials
} from 'react-icons/fa';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FocusTrap from 'focus-trap-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createPortal } from 'react-dom';
import ClipLoader from 'react-spinners/ClipLoader'; // For loading indicators
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import SwiperCore, * as swiper from 'swiper';
import { Helmet } from 'react-helmet'; // Import Helmet

// Initialize Swiper modules
SwiperCore.use([swiper.Autoplay, swiper.Pagination, swiper.Navigation]);

// Lazy load MembershipForm for performance optimization
const MembershipForm = lazy(() => import('./MembershipForm'));

/**
 * Modal Component with Focus Trap
 */
const Modal = React.memo(({ showModal, setShowModal, children }) => {
  const modalRef = useRef(null);

  // Close the modal when the user presses the Escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') setShowModal(false);
    };
    if (showModal) {
      document.addEventListener('keydown', handleEsc);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [showModal, setShowModal]);

  return createPortal(
    <AnimatePresence>
      {showModal && (
        <FocusTrap>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="modal-heading"
            onClick={() => setShowModal(false)} // Close when clicking on the backdrop
          >
            <motion.div
              className="bg-neutral-800 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 relative focus:outline-none overflow-y-auto max-h-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
              tabIndex="-1"
              ref={modalRef}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-300 hover:text-secondary focus:outline-none border border-transparent hover:border-secondary p-2 rounded-md transition-colors duration-200"
                aria-label="Close Modal"
              >
                <FaTimes size={20} aria-hidden="true" />
              </button>
              {/* Modal Content */}
              <div className="p-6">{children}</div>
            </motion.div>
          </motion.div>
        </FocusTrap>
      )}
    </AnimatePresence>,
    document.body
  );
});

/**
 * Reusable Component for Navigation Links with Icons and Enhanced Styles
 */
const NavLinks = React.memo(({ openModal, isSidebar = false, closeSidebar }) => {
  const sections = [
    { name: 'Home', icon: <FaHome aria-hidden="true" /> },
    { name: 'About', icon: <FaInfoCircle aria-hidden="true" /> },
    { name: 'Programs', icon: <FaDumbbell aria-hidden="true" /> },
    { name: 'Contact', icon: <FaEnvelope aria-hidden="true" /> },
  ];

  return (
    <>
      {sections.map((section) => (
        <ScrollLink
          key={section.name}
          activeClass="text-secondary border-b-4 border-secondary bg-neutral-700"
          to={section.name.toLowerCase()}
          spy={true}
          smooth={true}
          offset={-70}
          duration={500}
          className="flex items-center cursor-pointer text-gray-300 hover:text-secondary hover:bg-neutral-700 transition-colors duration-200 px-3 py-2 group rounded-md border border-transparent hover:border-secondary"
          tabIndex="0"
          onClick={() => {
            if (isSidebar) closeSidebar();
          }}
          role="tab"
          aria-label={section.name}
          aria-current={section.name === 'Home' ? 'page' : undefined} // Dynamically set aria-current
        >
          <span className="text-lg mr-2 transition-transform duration-200 group-hover:translate-x-1">
            {section.icon}
          </span>
          <span>{section.name}</span>
        </ScrollLink>
      ))}
      {/* "Join Now" as a button to open the modal */}
      <button
        onClick={() => {
          openModal();
          if (isSidebar) closeSidebar();
        }}
        className="ml-4 flex items-center px-4 py-2 bg-transparent border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200 cursor-pointer text-center focus:outline-none focus:ring-2 focus:ring-secondary "
        aria-label="Join Now"
      >
        <FaEnvelopeSquare className="mr-2" aria-hidden="true" />
        Join Now
      </button>
    </>
  );
});

/**
 * Sidebar Component with Enhanced Navigation Links
 */
const Sidebar = React.memo(({ isOpen, closeSidebar, openModal }) => {
  const sidebarVariants = {
    hidden: { x: '100%' }, // Start off-screen to the right
    visible: { x: '0%' }, // Slide into view
    exit: { x: '100%' }, // Slide out to the right
  };

  const sidebarRef = useRef(null);

  // Focus the first link when sidebar opens
  useEffect(() => {
    if (isOpen && sidebarRef.current) {
      const firstFocusableElement = sidebarRef.current.querySelector('a, button');
      if (firstFocusableElement) {
        firstFocusableElement.focus();
      }
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Sidebar */}
          <FocusTrap>
            <motion.aside
              className="fixed top-0 right-0 w-4/5 max-w-xs h-full bg-neutral-800 shadow-lg z-50 flex flex-col p-6"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={sidebarVariants}
              transition={{ type: 'tween', duration: 0.3 }}
              aria-label="Mobile Navigation Sidebar"
              ref={sidebarRef}
            >
              <div className="flex items-center justify-between mb-8">
                {/* Menu Title */}
                <div className="flex items-center">
                  <span className="font-bold text-xl text-gray-300">Menu</span>
                </div>
                {/* Close Button */}
                <button
                  onClick={closeSidebar}
                  className="text-gray-300 hover:text-secondary focus:outline-none border border-transparent hover:border-secondary p-2 rounded-md transition-colors duration-200"
                  aria-label="Close Sidebar"
                >
                  <FaTimes size={20} aria-hidden="true" />
                </button>
              </div>
              {/* Navigation Links */}
              <nav className="flex flex-col space-y-4">
                <NavLinks openModal={openModal} isSidebar={true} closeSidebar={closeSidebar} />
              </nav>
            </motion.aside>
          </FocusTrap>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            aria-hidden="true"
          ></motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

/**
 * Header Component with Enhanced Navigation Links
 */
const Header = React.memo(({ openModal, toggleSidebar, isSidebarOpen }) => {
  return (
    <header className="fixed w-full z-50 bg-neutral-800 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img
              src="/logo.png" // Ensure this image is in your public directory
              alt="Big Monkey Logo"
              className="h-8 w-8" // Adjust size as needed
              loading="lazy"
            />
            <span className="ml-2 font-bold text-xl text-gray-300">Big Monkey</span>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center" aria-label="Primary Navigation">
            <NavLinks openModal={openModal} />
          </nav>
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleSidebar}
              className="text-gray-300 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary border border-transparent hover:border-secondary p-2 rounded-md transition-colors duration-200"
              aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
              aria-expanded={isSidebarOpen}
              aria-controls="mobile-menu"
            >
              {isSidebarOpen ? <FaTimes size={24} aria-hidden="true" /> : <FaBars size={24} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

/**
 * AnimatedSection Component for Scroll Animations
 */
const AnimatedSection = ({ children, delay = 0 }) => {
  const controls = useAnimation();
  const ref = useRef();
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

/**
 * ImageGallery Component
 */
const ImageGallery = React.memo(({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const openImageModal = useCallback((image) => setSelectedImage(image), []);
  const closeImageModal = useCallback(() => setSelectedImage(null), []);

  return (
    <>
      <Swiper
        spaceBetween={10}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000 }}
        loop
        className="w-full"
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div
              className="relative cursor-pointer group"
              onClick={() => openImageModal(img)}
              role="button"
              tabIndex="0"
              onKeyPress={(e) => {
                if (e.key === 'Enter') openImageModal(img);
              }}
              aria-label={`Open image: ${img.alt}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
                loading="lazy"
              />
              <div
                className="absolute inset-0 bg-black bg-opacity-25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg"
                aria-hidden="true"
              >
                <FaImages className="text-white text-3xl" />
              </div>
              {img.caption && (
                <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                  {img.caption}
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Image Modal */}
      <Modal showModal={!!selectedImage} setShowModal={closeImageModal}>
        {selectedImage && (
          <div className="flex flex-col items-center">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-auto object-contain rounded-lg shadow-lg mb-6"
              loading="lazy"
            />
            {selectedImage.caption && (
              <p className="text-gray-300 mb-4">{selectedImage.caption}</p>
            )}
            <button
              onClick={closeImageModal}
              className="mt-2 px-4 py-2 bg-transparent border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary"
              aria-label="Close Image Modal"
            >
              Close
            </button>
          </div>
        )}
      </Modal>
    </>
  );
});

/**
 * VideoModal Component
 */
const VideoModal = React.memo(({ videoUrl, closeModal }) => (
  <Modal showModal={!!videoUrl} setShowModal={closeModal}>
    {videoUrl && (
      <div className="flex flex-col items-center">
        <div className="relative w-full h-0" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={videoUrl}
            title="Big Monkey Promotional Video"
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
        <button
          onClick={closeModal}
          className="mt-4 px-4 py-2 bg-transparent border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary"
          aria-label="Close Video Modal"
        >
          Close
        </button>
      </div>
    )}
  </Modal>
));

/**
 * Testimonials Component
 */
const Testimonials = React.memo(() => {
  // Array of testimonial objects
  const testimonials = [
    {
      quote: "Big Monkey transformed my fitness journey! The trainers are top-notch and the community is amazing.",
      name: "John Doe",
      position: "Professional Boxer",
      avatar: "/testimonials/john.jpg",
    },
    {
      quote: "I've never felt more confident and strong. Highly recommend Big Monkey to anyone serious about boxing.",
      name: "Jane Smith",
      position: "Fitness Enthusiast",
      avatar: "/testimonials/jane.jpg",
    },
    {
      quote: "The group classes are incredibly motivating. I've achieved goals I never thought possible.",
      name: "Mike Johnson",
      position: "Personal Trainer",
      avatar: "/testimonials/mike.jpg",
    },
    // Add more testimonials as needed
  ];

  return (
    // Swiper component for the carousel
    <Swiper
      spaceBetween={30} // Space between slides
      slidesPerView={1} // Number of slides to show at once
      autoplay={{ delay: 7000 }} // Autoplay with a delay of 7000ms
      pagination={{ clickable: true }} // Clickable pagination dots
      navigation // Navigation buttons
      loop // Infinite loop
      className="mt-20 " // Full width
    >
      {testimonials.map((testimonial, index) => (
        // SwiperSlide component for each testimonial
        <SwiperSlide key={index}>
          <motion.div
            className="bg-neutral-700 p-6 rounded-lg shadow-lg text-center" // Styling for the testimonial card
            initial={{ opacity: 0, scale: 0.95 }} // Initial animation state
            animate={{ opacity: 1, scale: 1 }} // Animation state
            transition={{ duration: 0.6 }} // Animation duration
          >
            <FaQuoteLeft className="text-secondary text-3xl mx-auto mb-4" aria-hidden="true" /> {/* Quote icon */}
            <p className="text-gray-300 italic mb-4">"{testimonial.quote}"</p> {/* Testimonial quote */}
            <div className="flex items-center justify-center space-x-4">
              <img
                src={testimonial.avatar}
                alt={`${testimonial.name}'s avatar`}
                className="w-12 h-12 rounded-full object-cover shadow-md" // Avatar styling
                loading="lazy" // Lazy loading for the image
              />
              <div>
                <p className="text-gray-200 font-semibold">{testimonial.name}</p> {/* Testimonial name */}
                <p className="text-gray-400 text-sm">{testimonial.position}</p> {/* Testimonial position */}
              </div>
            </div>
          </motion.div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
});

/**
 * Hero Section Component
 */
const HeroSection = React.memo(({ openModal }) => (
  <section
    id="home"
    className="relative h-screen flex items-center justify-center overflow-hidden"
    aria-labelledby="hero-heading"
  >
    {/* Background Video */}
    <video
      className="absolute top-0 left-0 w-full h-full object-cover"
      src="/boxing-hero.mp4"
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      preload="metadata" // Changed from "auto" to "metadata" for better performance
    >
      {/* Fallback Image */}
      <source src="/boxing-hero.mp4" type="video/mp4" />
      <img
        src="/boxing-fallback.jpg" // Ensure this image is in your public directory
        alt="Big Monkey Hero Background"
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </video>

    {/* Gradient Overlay */}
    <div
      className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-transparent to-transparent"
      aria-hidden="true"
    ></div>

    {/* Content */}
    <div className="relative z-10 text-center text-white px-4">
      <AnimatedSection>
        <motion.h1
          id="hero-heading"
          className="text-4xl md:text-6xl font-extrabold mb-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Unleash Your Potential
        </motion.h1>
      </AnimatedSection>
      <AnimatedSection delay={0.3}>
        <motion.p
          className="text-lg md:text-2xl mb-6 max-w-2xl mx-auto text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Join our community and transform your life through the art of boxing.
        </motion.p>
      </AnimatedSection>
      <AnimatedSection delay={0.6}>
        <motion.button
          onClick={openModal}
          className="px-6 py-3 bg-transparent border border-primary text-primary rounded-md text-lg font-medium hover:bg-primary hover:text-white transition-colors duration-200 inline-block focus:outline-none focus:ring-2 focus:ring-secondary active:scale-95"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          Get Started
        </motion.button>
      </AnimatedSection>
    </div>
  </section>
));

/**
 * About Section Component with Statistics, Media Tabs, and Testimonials
 */
const AboutSection = React.memo(() => {
  const [activeTab, setActiveTab] = useState('Videos');
  const [videoModal, setVideoModal] = useState(null);

  const openVideoModal = useCallback((videoUrl) => setVideoModal(videoUrl), []);
  const closeVideoModal = useCallback(() => setVideoModal(null), []);

  const photos = [
    { src: '/about/photos/photo1.jpg', alt: 'Training Session 1', caption: 'Intense training with our expert coaches.' },
    { src: '/about/photos/photo2.jpg', alt: 'Training Session 2', caption: 'Group classes fostering community spirit.' },
    { src: '/about/photos/photo3.jpg', alt: 'Training Session 3', caption: 'Personalized coaching tailored to your goals.' },
    { src: '/about/photos/photo4.jpg', alt: 'Training Session 4', caption: 'Achieving new heights together.' },
    // Add more photos as needed
  ];

  const videos = [
    {
      id: 1,
      title: 'Promotional Video',
      thumbnail: '/about/video-thumbnail1.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      alt: 'Promotional Video 1',
      caption: 'Watch our promotional video to learn more about Big Monkey.',
    },
    {
      id: 2,
      title: 'Training Tips',
      thumbnail: '/about/video-thumbnail2.jpg',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      alt: 'Training Tips Video',
      caption: 'Get expert training tips from our experienced coaches.',
    },
    // Add more videos as needed
  ];

  // Statistics Data
  const statistics = [
    { id: 1, label: 'Members', value: '100+' },
    { id: 2, label: 'Success Rate', value: '95%' },
  ];

  return (
    <section id="about" className="py-24 bg-neutral-900" role="region" aria-labelledby="about-heading">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 id="about-heading" className="text-3xl font-bold text-gray-200">
              About Us
            </h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              At Big Monkey, we believe in the power of boxing to transform lives. Our experienced trainers are
              dedicated to helping you achieve your fitness and personal goals in a supportive environment.
            </p>
          </div>
        </AnimatedSection>

        {/* Statistics Section */}
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-12 mb-12">
            {statistics.map((stat) => (
              <div key={stat.id} className="flex flex-col items-center mb-6 sm:mb-0">
                <h3 className="text-4xl font-bold text-secondary">{stat.value}</h3>
                <p className="text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Main Content: Media and Testimonials */}
        <AnimatedSection delay={0.4}>
          <div className="flex flex-col lg:flex-row lg:space-x-12">
            {/* Left Side: Media Tabs and Content */}
            <div className="lg:w-2/3">
              {/* Media Tabs */}
              <div className="mb-6 flex justify-center space-x-4" role="tablist" aria-label="Media Tabs">
                {['Videos', 'Images'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-md border ${
                      activeTab === tab
                        ? 'bg-secondary text-white border-secondary'
                        : 'bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors duration-200'
                    } focus:outline-none focus:ring-2 focus:ring-secondary`}
                    role="tab"
                    aria-selected={activeTab === tab}
                    aria-controls={`media-${tab.toLowerCase()}`}
                    id={`tab-${tab.toLowerCase()}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Media Content */}
              <div>
                {activeTab === 'Videos' && (
                  <div
                    id="media-videos"
                    role="tabpanel"
                    aria-labelledby="tab-videos"
                    className="transition-opacity duration-500"
                  >
                    <h3 className="text-2xl font-semibold text-gray-200 mb-4 flex items-center">
                      <FaVideo className="mr-2" aria-hidden="true" />
                      Our Videos
                    </h3>
                    <Swiper
                      spaceBetween={10}
                      slidesPerView={1}
                      navigation
                      pagination={{ clickable: true }}
                      autoplay={{ delay: 7000 }}
                      loop
                      className="w-full"
                    >
                      {videos.map((video) => (
                        <SwiperSlide key={video.id}>
                          <div
                            className="relative cursor-pointer group"
                            onClick={() => openVideoModal(video.videoUrl)}
                            role="button"
                            tabIndex="0"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') openVideoModal(video.videoUrl);
                            }}
                            aria-label={`Open video: ${video.title}`}
                          >
                            <img
                              src={video.thumbnail}
                              alt={video.alt}
                              className="w-full h-64 object-cover rounded-lg shadow-lg"
                              loading="lazy"
                            />
                            <div
                              className="absolute inset-0 bg-black bg-opacity-25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg"
                              aria-hidden="true"
                            >
                              <FaVideo className="text-white text-3xl" />
                            </div>
                            {video.caption && (
                              <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                                {video.caption}
                              </div>
                            )}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}

                {activeTab === 'Images' && (
                  <div
                    id="media-images"
                    role="tabpanel"
                    aria-labelledby="tab-images"
                    className="transition-opacity duration-500"
                  >
                    <h3 className="text-2xl font-semibold text-gray-200 mb-4 flex items-center">
                      <FaImages className="mr-2" aria-hidden="true" />
                      Our Photos
                    </h3>
                    <ImageGallery images={photos} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Testimonials */}
            <div className="lg:w-1/3 mt-8 lg:mt-0">
              <div className="sticky top-24">
                <Testimonials />
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>

      {/* Video Modal */}
      {videoModal && <VideoModal videoUrl={videoModal} closeModal={closeVideoModal} />}
    </section>
  );
});

/**
 * Enhanced Program Card Component
 */
const EnhancedProgramCard = React.memo(({ program, openProgramModal }) => (
  <motion.div
    className="bg-neutral-700 rounded-lg shadow-lg p-6 text-center cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl border border-transparent hover:border-secondary"
    whileHover={{ scale: 1.05, boxShadow: '0px 10px 20px rgba(0,0,0,0.2)' }}
    transition={{ duration: 0.3 }}
    onClick={() => openProgramModal(program)}
    role="button"
    tabIndex="0"
    onKeyPress={(e) => {
      if (e.key === 'Enter') openProgramModal(program);
    }}
    aria-label={`Learn more about ${program.title}`}
  >
    <div className="text-secondary text-4xl mx-auto mb-4" aria-hidden="true">
      {program.icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-200 mb-2">{program.title}</h3>
    <p className="text-gray-400 mb-4">{program.description}</p>
    <span className="text-secondary font-medium">{program.category}</span>
  </motion.div>
));

/**
 * Program Details Modal Component
 */
const ProgramDetailsModal = React.memo(({ program, closeModal }) => (
  <Modal showModal={!!program} setShowModal={closeModal}>
    <div className="p-6">
      <h2 id="modal-heading" className="text-2xl font-bold text-gray-200 mb-4">
        {program.title}
      </h2>
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-1/2">
          <img
            src={program.image} // Ensure these images are in your public directory
            alt={`${program.title} Image`}
            className="rounded-lg shadow-lg w-full h-auto object-cover mb-4 md:mb-0"
            loading="lazy"
          />
        </div>
        <div className="md:w-1/2 md:pl-6">
          <p className="text-gray-300 mb-4">{program.detailedDescription}</p>
          <ul className="list-disc list-inside text-gray-400 mb-4">
            {program.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <button
            onClick={closeModal}
            className="mt-4 px-4 py-2 bg-transparent border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary"
            aria-label="Close Program Details"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </Modal>
));

/**
 * Programs Section Component
 */
const ProgramsSection = React.memo(() => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [programModal, setProgramModal] = useState(null);

  const programs = [
    {
      id: 'individual-class',
      icon: <FaRunning />,
      title: 'Individual Class',
      description: 'Personalized boxing training tailored to your goals.',
      detailedDescription:
        'Our Individual Class program offers one-on-one training sessions with experienced coaches. Focus on personalized techniques, strength conditioning, and strategic planning to achieve your specific fitness and boxing goals.',
      features: ['Personalized Training', 'Technique Refinement', 'Strength Conditioning', 'Strategic Planning'],
      category: 'Individual',
      image: '/programs/individual-class.jpg',
    },
    {
      id: 'kids-group',
      icon: <FaUserFriends />,
      title: 'Kids Group',
      description: 'Fun and engaging boxing classes designed for children.',
      detailedDescription:
        'Our Kids Group program is tailored to introduce children to the fundamentals of boxing in a safe and supportive environment. Focus on discipline, coordination, and confidence-building.',
      features: ['Age-Appropriate Training', 'Discipline and Focus', 'Coordination Exercises', 'Confidence Building'],
      category: 'Group',
      image: '/programs/kids-group.jpg',
    },
    {
      id: 'adult-group',
      icon: <FaUserFriends />,
      title: 'Adult Group',
      description: 'Group boxing sessions for adults of all fitness levels.',
      detailedDescription:
        'The Adult Group program offers a balanced mix of boxing techniques and cardio workouts suitable for all fitness levels. Enhance your fitness, learn new skills, and meet like-minded individuals.',
      features: ['Inclusive Training', 'Cardio and Strength', 'Community Building', 'Flexible Scheduling'],
      category: 'Group',
      image: '/programs/adult-group.jpg',
    },
    {
      id: 'kickboxing',
      icon: <FaDumbbell />,
      title: 'Kickboxing',
      description: 'High-intensity kickboxing classes for a full-body workout.',
      detailedDescription:
        'Our Kickboxing program combines traditional boxing techniques with powerful kicks to provide a comprehensive full-body workout. Improve your strength, agility, and endurance while learning self-defense skills.',
      features: ['Full-Body Workout', 'Strength and Agility', 'Self-Defense Techniques', 'High-Intensity Training'],
      category: 'Kickboxing',
      image: '/programs/kickboxing.jpg',
    },
  ];

  const categories = ['All', 'Individual', 'Group', 'Kickboxing'];

  const filteredPrograms =
    selectedCategory === 'All'
      ? programs
      : programs.filter((program) => program.category === selectedCategory);

  const openProgramModal = useCallback((program) => setProgramModal(program), []);
  const closeProgramModal = useCallback(() => setProgramModal(null), []);

  return (
    <section id="programs" className="py-24 bg-neutral-900" role="region" aria-labelledby="programs-heading">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 id="programs-heading" className="text-3xl font-bold text-gray-200">
              Our Programs
            </h2>
            <p className="mt-4 text-gray-400">
              We offer a variety of programs to suit all skill levels and interests.
            </p>
          </div>
        </AnimatedSection>

        {/* Categories Filter */}
        <AnimatedSection delay={0.2}>
          <div
            className="flex justify-center mb-8 space-x-4 flex-wrap md:flex-nowrap"
            role="tablist"
            aria-label="Program Categories"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-md border ${
                  selectedCategory === category
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-transparent border-secondary text-secondary hover:bg-secondary hover:text-white transition-colors duration-200'
                } focus:outline-none focus:ring-2 focus:ring-secondary m-1 flex-1 min-w-[100px] md:min-w-0`}
                aria-pressed={selectedCategory === category}
                role="tab"
              >
                {category}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Programs Grid */}
        <AnimatedSection delay={0.4}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrograms.map((program) => (
              <EnhancedProgramCard
                key={program.id}
                program={program}
                openProgramModal={openProgramModal}
              />
            ))}
          </div>
        </AnimatedSection>

        {/* Program Details Modal */}
        {programModal && <ProgramDetailsModal program={programModal} closeModal={closeProgramModal} />}
      </div>
    </section>
  );
});

/**
 * Contact Section Component
 */
const ContactSection = React.memo(() => {
  // Handle Contact Form Submission
  const handleContactSubmit = useCallback(async (values, { resetForm, setSubmitting }) => {
    try {
      // Simulate form submission (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log('Contact Form Data:', values);
      toast.success('Message sent successfully!', {
        position: 'top-right',
        autoClose: 5000,
      });
      resetForm();
    } catch (error) {
      console.error('Form Submission Error:', error);
      toast.error('Failed to send message. Please try again later.', {
        position: 'top-right',
        autoClose: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Validation Schema for Contact Form
  const ContactSchema = Yup.object().shape({
    name: Yup.string().required('Name is required.'),
    email: Yup.string().email('Invalid email.').required('Email is required.'),
    subject: Yup.string().required('Subject is required.'),
    message: Yup.string().required('Message is required.'),
  });

  return (
    <section id="contact" className="py-24 bg-neutral-900" role="region" aria-labelledby="contact-heading">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        {/* Section Header */}
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 id="contact-heading" className="text-3xl font-bold text-gray-200">
              Get in Touch
            </h2>
            <p className="mt-4 text-gray-400">
              Have questions? We'd love to hear from you. Fill out the form below or reach us through our contact
              information.
            </p>
          </div>
        </AnimatedSection>

        {/* Contact Content */}
        <AnimatedSection delay={0.2}>
          <div className="flex flex-col lg:flex-row lg:space-x-12">
            {/* Contact Form */}
            <div className="lg:w-1/2">
              <Formik
                initialValues={{ name: '', email: '', subject: '', message: '' }}
                validationSchema={ContactSchema}
                onSubmit={handleContactSubmit}
              >
                {({ errors, touched, isValid, dirty, isSubmitting }) => (
                  <Form className="bg-neutral-700 p-6 rounded-lg shadow-lg border border-transparent hover:border-secondary transition-colors duration-200">
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-gray-200 font-medium mb-2">
                        Name
                      </label>
                      <Field
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Your Name"
                        className={`w-full px-4 py-2 border ${
                          errors.name && touched.name ? 'border-red-500' : 'border-gray-600'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-secondary bg-neutral-600 text-white transition-shadow duration-200 shadow-sm hover:shadow-md`}
                        aria-required="true"
                      />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-gray-200 font-medium mb-2">
                        Email
                      </label>
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        className={`w-full px-4 py-2 border ${
                          errors.email && touched.email ? 'border-red-500' : 'border-gray-600'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-secondary bg-neutral-600 text-white transition-shadow duration-200 shadow-sm hover:shadow-md`}
                        aria-required="true"
                      />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="subject" className="block text-gray-200 font-medium mb-2">
                        Subject
                      </label>
                      <Field
                        type="text"
                        id="subject"
                        name="subject"
                        placeholder="Subject"
                        className={`w-full px-4 py-2 border ${
                          errors.subject && touched.subject ? 'border-red-500' : 'border-gray-600'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-secondary bg-neutral-600 text-white transition-shadow duration-200 shadow-sm hover:shadow-md`}
                        aria-required="true"
                      />
                      <ErrorMessage name="subject" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="message" className="block text-gray-200 font-medium mb-2">
                        Message
                      </label>
                      <Field
                        as="textarea"
                        id="message"
                        name="message"
                        rows="5"
                        placeholder="Your message..."
                        className={`w-full px-4 py-2 border ${
                          errors.message && touched.message ? 'border-red-500' : 'border-gray-600'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-secondary bg-neutral-600 text-white transition-shadow duration-200 shadow-sm hover:shadow-md`}
                        aria-required="true"
                      />
                      <ErrorMessage name="message" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <button
                      type="submit"
                      disabled={!(isValid && dirty) || isSubmitting}
                      className={`w-full flex items-center justify-center px-4 py-2 bg-transparent border border-primary text-primary rounded-md hover:bg-primary hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-secondary ${
                        !(isValid && dirty) || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      aria-disabled={!(isValid && dirty) || isSubmitting}
                      aria-label="Send Message"
                    >
                      {isSubmitting ? (
                        <>
                          <ClipLoader size={20} color="#ffffff" /> Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
            {/* Contact Information and Map */}
            <div className="lg:w-1/2 mt-12 lg:mt-0">
              <div className="bg-neutral-700 p-6 rounded-lg shadow-lg border border-transparent hover:border-secondary transition-colors duration-200">
                <h3 className="text-xl font-semibold text-gray-200 mb-4">Contact Information</h3>
                <div className="flex items-start mb-4">
                  <FaPhone className="text-primary text-lg mr-3 mt-1" aria-hidden="true" />
                  <div>
                    <a
                      href="tel:+1234567890"
                      className="text-gray-300 hover:text-secondary transition-colors duration-200"
                    >
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
                <div className="flex items-start mb-4">
                  <FaEnvelope className="text-primary text-lg mr-3 mt-1" aria-hidden="true" />
                  <div>
                    <a
                      href="mailto:info@boxinggym.com"
                      className="text-gray-300 hover:text-secondary transition-colors duration-200"
                    >
                      info@boxinggym.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start mb-4">
                  <FaMapMarkerAlt className="text-primary text-lg mr-3 mt-1" aria-hidden="true" />
                  <div>
                    <span className="text-gray-300 block">110 S River Rd</span>
                    <span className="text-gray-300 block">Des Plaines, IL, 60016/suite 5</span>
                  </div>
                </div>
                {/* Social Media Links */}
                <div className="flex space-x-4 mt-4">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="text-gray-300 hover:text-secondary transition-colors duration-200"
                  >
                    <FaFacebookF />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter"
                    className="text-gray-300 hover:text-secondary transition-colors duration-200"
                  >
                    <FaTwitter />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-gray-300 hover:text-secondary transition-colors duration-200"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-gray-300 hover:text-secondary transition-colors duration-200"
                  >
                    <FaLinkedinIn />
                  </a>
                </div>
              </div>
              {/* Google Map Embed */}
              <div className="mt-8">
                <iframe
                  title="Big Monkey Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.902431635127!2d-88.08176308459347!3d42.02443517996181!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fdc9c81b0c9d1%3A0x4bcbf7f1a1a1c1b8!2s110%20S%20River%20Rd%2C%20Des%20Plaines%2C%20IL%2060016!5e0!3m2!1sen!2sus!4v1615469812134!5m2!1sen!2sus"
                  width="100%"
                  height="300"
                  className="border-0"
                  allowFullScreen=""
                  aria-hidden="false"
                  tabIndex="0"
                ></iframe>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
});

/**
 * Footer Component
 */
const Footer = React.memo(() => (
  <footer className="bg-neutral-800 py-8 shadow-inner" role="contentinfo">
    <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        {/* Logo and Description */}
        <div className="flex items-center mb-6 md:mb-0">
          <img
            src="/logo.png"
            alt="Big Monkey Logo"
            className="h-8 w-8" // Maintain consistency across all logos
            loading="lazy"
          />
          <span className="ml-2 font-bold text-xl text-gray-300">Big Monkey</span>
        </div>
        {/* Social Media Links */}
        <div className="flex space-x-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-gray-300 hover:text-secondary transition-colors duration-200"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-gray-300 hover:text-secondary transition-colors duration-200"
          >
            <FaTwitter />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-gray-300 hover:text-secondary transition-colors duration-200"
          >
            <FaInstagram />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-gray-300 hover:text-secondary transition-colors duration-200"
          >
            <FaLinkedinIn />
          </a>
        </div>
      </div>
      {/* Bottom Footer */}
      <div className="mt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Big Monkey. All rights reserved.
      </div>
    </div>
  </footer>
));

/**
 * Back-to-Top Button Component
 */
const BackToTop = React.memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = useCallback(() => {
    if (window.pageYOffset > 300) setIsVisible(true);
    else setIsVisible(false);
  }, []);

  const scrollToTop = useCallback(() => {
    scroll.scrollToTop({ duration: 700, smooth: 'easeInOutQuad' });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [toggleVisibility]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-transparent text-secondary p-3 rounded-full border-2 border-secondary shadow-lg hover:bg-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200 flex items-center justify-center"
          aria-label="Back to Top"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaArrowUp size={16} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
});

/**
 * Main BoxingLandingPage Component
 */
const BoxingLandingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  return (
    <>
      {/* Helmet for managing head */}
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <title>Big Monkey - Unleash Your Potential</title>
        <meta
          name="description"
          content="Join Big Monkey to transform your life through expert training and supportive community."
        />
        <meta name="keywords" content="Boxing, Gym, Fitness, Training, Health" />
        {/* Open Graph Tags */}
        <meta property="og:title" content="Big Monkey - Unleash Your Potential" />
        <meta property="og:description" content="Join Big Monkey to transform your life through expert training and supportive community." />
        <meta property="og:image" content="/boxing-og-image.jpg" />
        <meta property="og:url" content="https://www.boxinggym.com" />
        <meta name="twitter:card" content="summary_large_image" />
        {/* Additional SEO Tags */}
        <link rel="canonical" href="https://www.boxinggym.com" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="font-sans text-gray-300 bg-neutral-900 overflow-x-hidden">
        {/* Header */}
        <Header openModal={openModal} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} openModal={openModal} />

        {/* Main Content */}
        <main className="pt-16" role="main">
          {/* Hero Section */}
          <HeroSection openModal={openModal} />

          {/* About Section */}
          <AboutSection />

          {/* Programs/Classes Section */}
          <ProgramsSection />

          {/* Contact Section */}
          <ContactSection />
        </main>

        {/* Footer */}
        <Footer />

        {/* Back-to-Top Button */}
        <BackToTop />

        {/* Toast Notifications */}
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar />

        {/* Modal for Tryout Registration */}
        <Modal showModal={showModal} setShowModal={setShowModal}>
          <Suspense
            fallback={
              <div className="text-center">
                <ClipLoader size={50} color="#4F46E5" />
                <p className="mt-4 text-gray-300">Loading Tryout Registration Form...</p>
              </div>
            }
          >
            <MembershipForm />
          </Suspense>
        </Modal>
      </div>
    </>
  );
};

export default BoxingLandingPage;
