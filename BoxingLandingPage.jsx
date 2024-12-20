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
  FaBars,
  FaTimes,
  FaArrowUp,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CountUp from 'react-countup';
import FocusTrap from 'focus-trap-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { createPortal } from 'react-dom';
import ClipLoader from 'react-spinners/ClipLoader'; // For loading indicators
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import SwiperCore, * as swiper from 'swiper';

// Initialize Swiper modules
SwiperCore.use([swiper.Autoplay, swiper.Pagination]);

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

  // Prevent scrolling when the modal is open and focus trap
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
          >
            <motion.div
              className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 relative focus:outline-none"
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
                className="absolute top-4 right-4 text-gray-600 hover:text-indigo-600 focus:outline-none"
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
 * Reusable Component for Navigation Links
 */
const NavLinks = React.memo(({ isMobile, toggleMenu, openModal }) => {
  const sections = ['Home', 'About', 'Programs', 'Contact'];

  return (
    <>
      {sections.map((section) => (
        <ScrollLink
          key={section}
          activeClass="text-indigo-600 border-b-2 border-indigo-600"
          to={section.toLowerCase()}
          spy={true}
          smooth={true}
          offset={-70}
          duration={500}
          className={`cursor-pointer text-gray-600 hover:text-indigo-600 transition-colors duration-200 ${
            isMobile ? 'block py-2' : 'px-3 py-2'
          }`}
          onClick={isMobile ? toggleMenu : undefined}
          tabIndex="0"
        >
          {section}
        </ScrollLink>
      ))}
      {/* "Join Now" as a button to open the modal */}
      <button
        onClick={() => {
          openModal();
          if (isMobile) toggleMenu();
        }}
        className={`ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 cursor-pointer ${
          isMobile ? 'block mt-2 w-full text-center' : ''
        }`}
      >
        Join Now
      </button>
    </>
  );
});

/**
 * Header Component with Mobile Navigation
 */
const Header = React.memo(({ openModal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);

  const toggleMenu = useCallback(() => setIsMobileMenuOpen((prev) => !prev), []);

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  return (
    <header
      className="fixed w-full bg-white shadow-md z-50 transition-shadow duration-300"
      ref={headerRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <FaRunning className="text-indigo-600 text-3xl" aria-hidden="true" />
            <span className="ml-2 font-bold text-xl text-gray-800">Boxing Gym</span>
          </div>
          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex space-x-8 items-center"
            aria-label="Primary Navigation"
          >
            <NavLinks isMobile={false} openModal={openModal} />
          </nav>
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-md"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="h-6 w-6" aria-hidden="true" />
              ) : (
                <FaBars className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav
            id="mobile-menu"
            className="md:hidden bg-white shadow-lg"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-label="Mobile Navigation"
          >
            <div className="px-4 pt-4 pb-6 space-y-1">
              <NavLinks isMobile={true} toggleMenu={toggleMenu} openModal={openModal} />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
});

/**
 * Hero Section Component
 */
const HeroSection = React.memo(({ openModal }) => (
  <section
    id="home"
    className="relative h-screen flex items-center justify-center"
    aria-labelledby="hero-heading"
  >
    {/* Video Background */}
    <video
      className="absolute top-0 left-0 w-full h-full object-cover"
      src="/boxing-hero.mp4" // Ensure this video is in your public directory
      autoPlay
      loop
      muted
      playsInline
      aria-hidden="true"
      preload="auto"
    >
      {/* Fallback Image */}
      <source src="/boxing-hero.mp4" type="video/mp4" />
      <img
        src="/boxing-fallback.jpg" // Ensure this image is in your public directory
        alt="Boxing Gym Hero Background"
        className="w-full h-full object-cover"
      />
    </video>

    {/* Gradient Overlay */}
    <div
      className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-transparent to-transparent"
      aria-hidden="true"
    ></div>

    {/* Content */}
    <div className="relative z-10 text-center text-black px-2">
      <motion.h1
        id="hero-heading"
        className="text-4xl md:text-6xl font-extrabold mb-4"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Unleash Your Potential
      </motion.h1>
      <motion.p
        className="text-lg md:text-2xl mb-6 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        Join our community and transform your life through the art of boxing.
      </motion.p>
      <motion.button
        onClick={openModal}
        className="px-6 py-3 bg-indigo-600 text-white rounded-md text-lg font-medium hover:bg-indigo-700 transition-colors duration-200 inline-block focus:outline-none focus:ring-2 focus:ring-indigo-400"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        Get Started
      </motion.button>
    </div>
  </section>
));

/**
 * About Section Component
 */
const AboutSection = React.memo(() => (
  <section id="about" className="py-20 bg-gray-100" role="region" aria-labelledby="about-heading">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 id="about-heading" className="text-3xl font-bold text-gray-800">
          About Us
        </h2>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          At Boxing Gym, we believe in the power of boxing to transform lives. Our experienced trainers are
          dedicated to helping you achieve your fitness and personal goals in a supportive environment.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="text-center">
          <CountUp
            start={0}
            end={100}
            duration={2}
            suffix="+"
            className="block text-4xl font-bold text-indigo-600"
          />
          <p className="mt-2 text-gray-700">Members</p>
        </div>
        <div className="text-center">
          <CountUp
            start={0}
            end={50}
            duration={2}
            suffix="+"
            className="block text-4xl font-bold text-indigo-600"
          />
          <p className="mt-2 text-gray-700">Programs</p>
        </div>
        <div className="text-center">
          <CountUp
            start={0}
            end={95}
            duration={2}
            suffix="%"
            className="block text-4xl font-bold text-indigo-600"
          />
          <p className="mt-2 text-gray-700">Success Rate</p>
        </div>
      </div>

      {/* About Content */}
      <div className="flex flex-col md:flex-row items-center md:space-x-6">
        <div className="md:w-1/2 relative group">
          <img
            src="/about-boxing.jpg" // Ensure this image is in your public directory
            alt="Boxing Gym Training Session"
            className="rounded-lg shadow-lg w-full transform transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div
            className="absolute inset-0 bg-indigo-600 bg-opacity-25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
            aria-hidden="true"
          ></div>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0">
          <p className="text-gray-700 mb-4">
            Whether you're a beginner or an experienced boxer, our programs are tailored to fit your needs. We
            focus on technique, conditioning, and mental toughness to ensure you get the most out of every
            session.
          </p>
          <p className="text-gray-700 mb-6">
            Join us today and become part of a community that supports and motivates each other to reach new
            heights.
          </p>

          {/* Testimonials Carousel */}
          <Swiper
            spaceBetween={30}
            centeredSlides
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            className="w-full"
            aria-label="Testimonials Carousel"
          >
            <SwiperSlide>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-gray-700 mb-4">
                  "Boxing Gym transformed my life! The trainers are amazing and the community is incredibly supportive."
                </p>
                <h4 className="text-indigo-600 font-semibold">- Sarah L.</h4>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-gray-700 mb-4">
                  "I've never felt stronger or more confident. The programs are well-structured and effective."
                </p>
                <h4 className="text-indigo-600 font-semibold">- Mike D.</h4>
              </div>
            </SwiperSlide>
            <SwiperSlide>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-gray-700 mb-4">
                  "A fantastic place to train! The facilities are top-notch and the staff truly cares about your progress."
                </p>
                <h4 className="text-indigo-600 font-semibold">- Jessica K.</h4>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </div>
  </section>
));

/**
 * Enhanced Program Card Component
 */
const EnhancedProgramCard = React.memo(({ program, openProgramModal }) => (
  <div
    className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300 cursor-pointer"
    onClick={() => openProgramModal(program)}
    role="button"
    tabIndex="0"
    onKeyPress={(e) => {
      if (e.key === 'Enter') openProgramModal(program);
    }}
    aria-label={`Learn more about ${program.title}`}
  >
    <div className="text-indigo-600 text-4xl mx-auto mb-4" aria-hidden="true">
      {program.icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{program.title}</h3>
    <p className="text-gray-600 mb-4">{program.description}</p>
    <span className="text-indigo-600 font-medium">{program.category}</span>
  </div>
));

/**
 * Program Details Modal Component
 */
const ProgramDetailsModal = React.memo(({ program, closeModal }) => (
  <Modal showModal={!!program} setShowModal={closeModal}>
    <div className="p-6">
      <h2 id="modal-heading" className="text-2xl font-bold text-gray-800 mb-4">
        {program.title}
      </h2>
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-1/2">
          <img
            src={program.image} // Ensure these images are in your public directory
            alt={`${program.title} Image`}
            className="rounded-lg shadow-lg w-full mb-4 md:mb-0"
            loading="lazy"
          />
        </div>
        <div className="md:w-1/2 md:pl-6">
          <p className="text-gray-700 mb-4">{program.detailedDescription}</p>
          <ul className="list-disc list-inside text-gray-700 mb-4">
            {program.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
          <button
            onClick={closeModal}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
      id: 'beginner-boxing',
      icon: <FaRunning />,
      title: 'Beginner Boxing',
      description: 'Learn the fundamentals of boxing in a supportive environment.',
      detailedDescription:
        'Our Beginner Boxing program is designed for those new to boxing. You will learn the basic techniques, footwork, and defensive maneuvers to build a strong foundation.',
      features: ['Basic Techniques', 'Footwork Training', 'Defensive Skills', 'Conditioning'],
      category: 'Beginner',
      image: '/programs/beginner-boxing.jpg', // Ensure this image is in your public directory
    },
    {
      id: 'advanced-training',
      icon: <FaDumbbell />,
      title: 'Advanced Training',
      description: 'Enhance your skills and performance with our advanced training.',
      detailedDescription:
        'The Advanced Training program is tailored for seasoned boxers looking to refine their techniques, improve their strength, and enhance overall performance.',
      features: ['Advanced Techniques', 'Strength Conditioning', 'Sparring Sessions', 'Performance Analysis'],
      category: 'Advanced',
      image: '/programs/advanced-training.jpg', // Ensure this image is in your public directory
    },
    {
      id: 'group-classes',
      icon: <FaUserFriends />,
      title: 'Group Classes',
      description: 'Join dynamic group sessions that combine boxing with cardio workouts.',
      detailedDescription:
        'Our Group Classes offer a fun and energetic environment where you can engage in boxing drills, cardio exercises, and team-based challenges to keep you motivated.',
      features: ['Cardio Boxing', 'Team Challenges', 'Motivational Coaching', 'Flexible Schedules'],
      category: 'Group',
      image: '/programs/group-classes.jpg', // Ensure this image is in your public directory
    },
    // Add more programs as needed
  ];

  const categories = ['All', 'Beginner', 'Advanced', 'Group'];

  const filteredPrograms =
    selectedCategory === 'All'
      ? programs
      : programs.filter((program) => program.category === selectedCategory);

  const openProgramModal = useCallback((program) => setProgramModal(program), []);
  const closeProgramModal = useCallback(() => setProgramModal(null), []);

  return (
    <section id="programs" className="py-20" role="region" aria-labelledby="programs-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 id="programs-heading" className="text-3xl font-bold text-gray-800">
            Our Programs
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            We offer a variety of programs to suit all skill levels and interests.
          </p>
        </div>

        {/* Categories Filter */}
        <div className="flex justify-center mb-8 space-x-4" role="tablist" aria-label="Program Categories">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md border ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400`}
              aria-pressed={selectedCategory === category}
              role="tab"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPrograms.map((program) => (
            <EnhancedProgramCard
              key={program.id}
              program={program}
              openProgramModal={openProgramModal}
            />
          ))}
        </div>

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
    <section id="contact" className="py-20 bg-gray-100" role="region" aria-labelledby="contact-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 id="contact-heading" className="text-3xl font-bold text-gray-800">
            Get in Touch
          </h2>
          <p className="mt-4 text-gray-600">
            Have questions? We'd love to hear from you. Fill out the form below or reach us through our contact
            information.
          </p>
        </div>
        {/* Contact Content */}
        <div className="flex flex-col lg:flex-row lg:space-x-12">
          {/* Contact Form */}
          <div className="lg:w-1/2">
            <Formik
              initialValues={{ name: '', email: '', subject: '', message: '' }}
              validationSchema={ContactSchema}
              onSubmit={handleContactSubmit}
            >
              {({ isValid, dirty, isSubmitting }) => (
                <Form className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                      Name
                    </label>
                    <Field
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Your Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-required="true"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                      Email
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-required="true"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                      Subject
                    </label>
                    <Field
                      type="text"
                      id="subject"
                      name="subject"
                      placeholder="Subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-required="true"
                    />
                    <ErrorMessage name="subject" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                      Message
                    </label>
                    <Field
                      as="textarea"
                      id="message"
                      name="message"
                      rows="5"
                      placeholder="Your message..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-required="true"
                    />
                    <ErrorMessage name="message" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <button
                    type="submit"
                    disabled={!(isValid && dirty) || isSubmitting}
                    className={`w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                      !(isValid && dirty) || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-disabled={!(isValid && dirty) || isSubmitting}
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
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="flex items-start mb-4">
                <FaPhone className="text-indigo-600 text-lg mr-3 mt-1" aria-hidden="true" />
                <div>
                  <a
                    href="tel:+1234567890"
                    className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
              </div>
              <div className="flex items-start mb-4">
                <FaEnvelope className="text-indigo-600 text-lg mr-3 mt-1" aria-hidden="true" />
                <div>
                  <a
                    href="mailto:info@boxinggym.com"
                    className="text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                  >
                    info@boxinggym.com
                  </a>
                </div>
              </div>
              <div className="flex items-start mb-4">
                <FaMapMarkerAlt className="text-indigo-600 text-lg mr-3 mt-1" aria-hidden="true" />
                <div>
                  <span className="text-gray-700 block">1234 Boxing Ave, Suite 100,</span>
                  <span className="text-gray-700 block">City, State, ZIP</span>
                </div>
              </div>
              {/* Social Media Links */}
              <div className="flex space-x-4 mt-4">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  <FaTwitter />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                >
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
            {/* Google Map Embed */}
            <div className="mt-8">
              <iframe
                title="Boxing Gym Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0192546035764!2d-122.41941508468176!3d37.77492977975925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c1e9d7e07%3A0x3b5b4b7e3c3a2b1c!2sBoxing%20Gym!5e0!3m2!1sen!2sus!4v1615469812134!5m2!1sen!2sus"
                width="100%"
                height="300"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex="0"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

/**
 * Footer Component
 */
const Footer = React.memo(() => (
  <footer className="bg-white py-6 shadow-inner" role="contentinfo">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
      <p className="text-gray-600 text-sm">© {new Date().getFullYear()} Boxing Gym. All rights reserved.</p>
      <div className="flex space-x-4 mt-4 md:mt-0">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
        >
          <FaFacebookF />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Twitter"
          className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
        >
          <FaTwitter />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
        >
          <FaInstagram />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
        >
          <FaLinkedinIn />
        </a>
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
    scroll.scrollToTop({ duration: 500, smooth: 'easeInOutQuad' });
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
          className="fixed bottom-8 right-8 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Back to Top"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaArrowUp aria-hidden="true" />
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

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  return (
    <div className="font-sans text-gray-700">
      {/* Header */}
      <Header openModal={openModal} />

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
              <ClipLoader size={50} color="#123abc" />
              <p className="mt-4">Loading Tryout Registration Form...</p>
            </div>
          }
        >
          <MembershipForm />
        </Suspense>
      </Modal>
    </div>
  );
};

export default BoxingLandingPage;
