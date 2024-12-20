// MembershipForm.jsx

import React, { useState, useRef, useEffect } from 'react';
import {
  FaRunning,
  FaCheckCircle,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaTimes,
} from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage, useField } from 'formik';
import * as Yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import classNames from 'classnames';
import './DatePickerStyles.css'; // Custom styles for react-datepicker

// Setting up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Utility Functions for Form Persistence
const loadFormData = () => {
  const data = localStorage.getItem('membershipFormData');
  return data
    ? JSON.parse(data)
    : {
        firstName: '',
        lastName: '',
        gender: '',
        phone: '',
        email: '',
        dob: '',
        agreeToTexts: false,
        tryoutType: '',
        selectedTrial: '',
        signedWaiver: '',
        hasReadWaiver: false,
      };
};

const saveFormData = (data) => {
  localStorage.setItem('membershipFormData', JSON.stringify(data));
};

// Custom Input Component for DatePicker
const CustomInput = React.forwardRef(({ value, onClick, onChange, placeholder }, ref) => (
  <div className="relative">
    <input
      type="text"
      onClick={onClick}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      ref={ref}
      className="border rounded p-2 pl-8 pr-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full bg-white placeholder-gray-400 text-sm"
      readOnly
      aria-label="Date of Birth"
    />
    <FaCalendarAlt className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
  </div>
));
CustomInput.displayName = 'CustomInput';

// Custom DatePicker Component with Enhanced Styling and Features
const CustomDatePicker = ({ label, ...props }) => {
  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  return (
    <div className="flex flex-col">
      <label htmlFor={props.name} className="text-sm font-medium mb-1 text-gray-700 flex items-center">
        <FaCalendarAlt className="mr-2 text-gray-500" />
        {label}
      </label>
      <div className="relative">
        <DatePicker
          {...field}
          {...props}
          selected={(field.value && new Date(field.value)) || null}
          onChange={(val) => {
            setValue(val);
          }}
          dateFormat="MM/dd/yyyy"
          customInput={<CustomInput />}
          placeholderText="Select your date of birth"
          maxDate={new Date(Date.now() - 567648000000)} // At least 18 years old
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          className="w-full"
          aria-describedby={`${props.name}-error`}
        />
        {field.value && (
          <button
            type="button"
            onClick={() => setValue(null)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 focus:outline-none"
            aria-label="Clear date"
          >
            <FaTimes />
          </button>
        )}
      </div>
      {meta.touched && meta.error ? (
        <div id={`${props.name}-error`} className="text-red-500 text-xs mt-1">
          {meta.error}
        </div>
      ) : null}
    </div>
  );
};

// Progress Indicator Component
const ProgressIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center mb-6">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <div
            className={classNames(
              'flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full border-2 transition-colors duration-300 relative',
              {
                'bg-green-500 border-green-500 text-white': currentStep > index + 1,
                'bg-indigo-600 border-indigo-600 text-white': currentStep === index + 1,
                'bg-white border-gray-300 text-gray-500': currentStep < index + 1,
              }
            )}
            aria-current={currentStep === index + 1 ? 'step' : undefined}
            aria-label={`Step ${index + 1}: ${step.name}`}
            data-tooltip={step.name}
          >
            {currentStep > index + 1 ? <FaCheck /> : index + 1}
          </div>
          <span className="mt-1 text-xs md:text-sm text-center font-medium text-gray-700">
            {step.name}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div
            className={classNames(
              'flex-1 h-0.5 transition-colors duration-300',
              {
                'bg-green-500': currentStep > index + 1,
                'bg-gray-300': currentStep <= index + 1,
              }
            )}
            aria-hidden="true"
          ></div>
        )}
      </React.Fragment>
    ))}
  </div>
);

// Member Details Form Component
const MemberDetailsForm = ({ formData, setFormData, next }) => {
  const validationSchema = Yup.object({
    firstName: Yup.string().required('First Name is required.'),
    lastName: Yup.string().required('Last Name is required.'),
    gender: Yup.string().required('Gender is required.'),
    email: Yup.string().email('Invalid email address.').required('Email is required.'),
    phone: Yup.string()
      .matches(/^\(\d{3}\) \d{3}-\d{4}$/, 'Phone number must be in the format (555) 555-5555.')
      .required('Phone number is required.'),
    dob: Yup.date()
      .max(new Date(Date.now() - 567648000000), 'You must be at least 18 years.')
      .required('Date of Birth is required.'),
    agreeToTexts: Yup.boolean(),
  });

  return (
    <Formik
      initialValues={formData}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        setFormData(values);
        saveFormData(values);
        next();
      }}
    >
      {({ isValid, dirty, values, setFieldValue }) => (
        <Form>
          <motion.div
            className="bg-white p-2 md:p-4 rounded-lg shadow space-y-4 max-w-sm mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg md:text-xl font-bold text-gray-900 border-b pb-2 flex items-center justify-center">
              <FaUser className="mr-2 text-indigo-600" />
              Member Details
            </h2>
            <div className="grid gap-2 md:gap-4 sm:grid-cols-2">
              <div className="flex flex-col">
                <label htmlFor="firstName" className="text-xs font-medium mb-0.5 text-gray-700 flex items-center">
                  <FaUser className="mr-1 text-gray-500" />
                  First Name
                </label>
                <Field
                  type="text"
                  name="firstName"
                  id="firstName"
                  placeholder="John"
                  className="border rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                  aria-required="true"
                />
                <ErrorMessage name="firstName" component="div" className="text-red-500 text-xs mt-0.5" />
              </div>

              <div className="flex flex-col">
                <label htmlFor="lastName" className="text-xs font-medium mb-0.5 text-gray-700 flex items-center">
                  <FaUser className="mr-1 text-gray-500" />
                  Last Name
                </label>
                <Field
                  type="text"
                  name="lastName"
                  id="lastName"
                  placeholder="Doe"
                  className="border rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                  aria-required="true"
                />
                <ErrorMessage name="lastName" component="div" className="text-red-500 text-xs mt-0.5" />
              </div>

              <div className="flex flex-col">
                <label htmlFor="gender" className="text-xs font-medium mb-0.5 text-gray-700">
                  Gender
                </label>
                <Field
                  as="select"
                  name="gender"
                  id="gender"
                  className="border rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white text-sm"
                  aria-required="true"
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </Field>
                <ErrorMessage name="gender" component="div" className="text-red-500 text-xs mt-0.5" />
              </div>

              <div className="flex flex-col">
                <label htmlFor="email" className="text-xs font-medium mb-0.5 text-gray-700 flex items-center">
                  <FaEnvelope className="mr-1 text-gray-500" />
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  placeholder="john.doe@example.com"
                  className="border rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                  aria-required="true"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-0.5" />
              </div>

              <div className="flex flex-col">
                <label htmlFor="phone" className="text-xs font-medium mb-0.5 text-gray-700 flex items-center">
                  <FaPhone className="mr-1 text-gray-500" />
                  Phone
                </label>
                <Field
                  type="tel"
                  name="phone"
                  id="phone"
                  placeholder="(555) 555-5555"
                  className="border rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
                  aria-required="true"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    const formattedPhone = value
                      ? `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`
                      : '';
                    setFieldValue('phone', formattedPhone);
                    setFormData({ ...formData, phone: formattedPhone });
                  }}
                />
                <ErrorMessage name="phone" component="div" className="text-red-500 text-xs mt-0.5" />
                <small className="text-xs text-gray-500">Format: (555) 555-5555</small>
              </div>

              <div className="flex flex-col">
                <CustomDatePicker label="Date of Birth" name="dob" id="dob" aria-required="true" />
              </div>
            </div>

            <div className="flex items-center mt-2 space-x-1">
              <Field
                type="checkbox"
                name="agreeToTexts"
                id="agreeToTexts"
                className="w-3 h-3 text-indigo-600 focus:ring-indigo-400 border-gray-300 rounded"
                aria-checked={values.agreeToTexts}
              />
              <label htmlFor="agreeToTexts" className="text-gray-700 text-sm">
                Get the text confirmation
              </label>
            </div>

            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={!(isValid && dirty)}
                className={`px-3 py-1.5 rounded-md text-white ${
                  isValid && dirty ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'
                } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm`}
                aria-disabled={!(isValid && dirty)}
              >
                Next
              </button>
            </div>
          </motion.div>
        </Form>
      )}
    </Formik>
  );
};

// Tryout Selection Form Component
const TryoutSelectionForm = ({ formData, setFormData, next, back }) => {
  const trials = [
    { name: 'TRIAL - MMA', time: '10:00 AM - 11:00 AM', cost: 'FREE', icon: <FaRunning /> },
    { name: 'TRIAL - MUAY THAI', time: '11:00 AM - 12:00 PM', cost: 'FREE', icon: <FaRunning /> },
    { name: 'TRIAL - WRESTLING', time: '1:00 PM - 2:00 PM', cost: 'FREE', icon: <FaRunning /> },
  ];

  const validationSchema = Yup.object({
    tryoutType: Yup.string().required('Please select a tryout type.'),
    selectedTrial: Yup.string().required('Please select a trial session.'),
  });

  return (
    <Formik
      initialValues={formData}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        setFormData(values);
        saveFormData(values);
        next();
      }}
    >
      {({ values, isValid, dirty, setFieldValue }) => (
        <Form>
          <motion.div
            className="bg-white p-2 md:p-4 rounded-lg shadow space-y-4 max-w-sm mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg md:text-xl font-bold text-gray-900 border-b pb-2 flex items-center justify-center">
              <FaRunning className="mr-2 text-indigo-600" />
              Tryout Selection
            </h2>

            <div className="flex flex-col sm:flex-row sm:space-x-3">
              {['Individual', 'Doubles'].map((type) => (
                <label key={type} className="flex-1 cursor-pointer" aria-label={`Select ${type} tryout`}>
                  <div
                    className={classNames(
                      'border rounded-lg p-2 flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400',
                      {
                        'bg-indigo-600 text-white border-indigo-600': values.tryoutType === type,
                        'bg-white text-gray-700 border-gray-300 hover:bg-indigo-50': values.tryoutType !== type,
                      }
                    )}
                    onClick={() => setFieldValue('tryoutType', type)}
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setFieldValue('tryoutType', type);
                      }
                    }}
                    role="button"
                    aria-pressed={values.tryoutType === type}
                  >
                    <span className="text-sm font-medium">{type}</span>
                  </div>
                </label>
              ))}
            </div>
            <ErrorMessage name="tryoutType" component="div" className="text-red-500 text-xs mt-0.5" />

            <div className="space-y-3">
              {trials.map((trial) => (
                <div
                  key={trial.name}
                  className={classNames(
                    'flex flex-col sm:flex-row sm:items-center p-2 border rounded-lg transition-all duration-200 ease-in-out cursor-pointer hover:shadow-lg',
                    {
                      'bg-indigo-50 border-indigo-400': values.selectedTrial === trial.name,
                      'bg-white border-gray-300': values.selectedTrial !== trial.name,
                    }
                  )}
                  onClick={() => setFieldValue('selectedTrial', trial.name)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setFieldValue('selectedTrial', trial.name);
                    }
                  }}
                  aria-pressed={values.selectedTrial === trial.name}
                >
                  <div className="flex items-center mb-1 sm:mb-0 sm:mr-3">
                    <div className="text-xl text-indigo-600 mr-2">{trial.icon}</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{trial.name}</div>
                      <div className="text-xs text-gray-600">
                        Time: {trial.time}, Cost: {trial.cost}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={classNames(
                      'px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200',
                      {
                        'bg-indigo-600 text-white cursor-default': values.selectedTrial === trial.name,
                        'bg-indigo-500 text-white hover:bg-indigo-600': values.selectedTrial !== trial.name,
                      }
                    )}
                    onClick={() => setFieldValue('selectedTrial', trial.name)}
                    aria-label={`Select ${trial.name}`}
                  >
                    {values.selectedTrial === trial.name ? (
                      <>
                        <FaCheckCircle className="inline-block mr-1" />
                        SELECTED
                      </>
                    ) : (
                      'SELECT'
                    )}
                  </button>
                </div>
              ))}
            </div>
            <ErrorMessage name="selectedTrial" component="div" className="text-red-500 text-xs mt-0.5" />

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={back}
                className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
              >
                <FaArrowLeft />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={!(isValid && dirty)}
                className={classNames(
                  'flex items-center space-x-1 px-3 py-1 rounded-md text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm',
                  {
                    'bg-indigo-600 hover:bg-indigo-700': isValid && dirty,
                    'bg-indigo-300 cursor-not-allowed': !(isValid && dirty),
                  }
                )}
                aria-disabled={!(isValid && dirty)}
              >
                <span>Next</span>
                <FaArrowRight />
              </button>
            </div>
          </motion.div>
        </Form>
      )}
    </Formik>
  );
};

// Tryout Waiver Form Component
const TryoutWaiverForm = ({ formData, setFormData, next, back }) => {
  const [numPages, setNumPages] = useState(null);
  const sigCanvasRef = useRef({});
  const [pdfWidth, setPdfWidth] = useState(300); // Reduced width from 600 to 300
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    signedWaiver: Yup.string().required('You must sign the waiver.'),
    hasReadWaiver: Yup.boolean()
      .oneOf([true], 'You must confirm that you have read the waiver.')
      .required('You must confirm that you have read the waiver.'),
  });

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const clearSignature = (setFieldValue) => {
    sigCanvasRef.current.clear();
    setFieldValue('signedWaiver', '');
    toast.info('Signature cleared.', {
      position: 'top-right',
      autoClose: 3000,
    });
  };

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setPdfWidth(window.innerWidth * 0.9); // Reduced to 90%
    } else {
      setPdfWidth(300); // Reduced from 600 to 300
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    setFormData({ ...formData, ...values });
    saveFormData({ ...formData, ...values });
    // Simulate API call delay
    setTimeout(() => {
      next();
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <Formik
      initialValues={{
        signedWaiver: formData.signedWaiver || '',
        hasReadWaiver: formData.hasReadWaiver || false,
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, isValid, dirty, values }) => (
        <Form>
          <motion.div
            className="bg-white p-2 md:p-4 rounded-lg shadow-lg space-y-4 max-w-sm mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg md:text-xl font-bold text-gray-900 border-b pb-2 flex items-center justify-center">
              <FaCheckCircle className="mr-2 text-green-600" />
              Tryout Waiver
            </h2>
            <div className="flex flex-col items-center">
              <div className="w-full overflow-auto rounded-lg shadow-inner mb-4">
                <Document
                  file="/waiver.pdf"
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="rounded-lg"
                  loading={
                    <div className="flex justify-center items-center h-40">
                      <svg
                        className="animate-spin h-6 w-6 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                    </div>
                  }
                  error={
                    <div className="text-red-500 text-center">
                      Failed to load the waiver PDF.
                    </div>
                  }
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page key={`page_${index + 1}`} pageNumber={index + 1} width={pdfWidth} className="mb-2" />
                  ))}
                </Document>
              </div>

              <div className="w-full flex items-center mb-2">
                <Field
                  type="checkbox"
                  name="hasReadWaiver"
                  id="hasReadWaiver"
                  className="w-3 h-3 text-indigo-600 focus:ring-indigo-400 border-gray-300 rounded"
                  aria-checked={values.hasReadWaiver}
                />
                <label htmlFor="hasReadWaiver" className="ml-1 text-gray-700 text-sm">
                  I have read and understood the waiver.
                </label>
              </div>
              <ErrorMessage name="hasReadWaiver" component="div" className="text-red-500 text-xs mt-0.5" />

              <div className="w-full">
                <label className="text-sm font-medium mb-0.5 text-gray-700 block">
                  Signature <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <SignatureCanvas
                    penColor="black"
                    canvasProps={{
                      width: pdfWidth,
                      height: 150, // Reduced height for smaller size
                      className: "border rounded-lg w-full",
                    }}
                    ref={sigCanvasRef}
                    onEnd={() => {
                      const trimmedDataURL = sigCanvasRef.current
                        .getTrimmedCanvas()
                        .toDataURL('image/png');
                      setFieldValue('signedWaiver', trimmedDataURL);
                    }}
                    clearOnResize={false}
                  />
                  {!values.signedWaiver && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-gray-400 text-xs">Sign here</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-1">
                  <button
                    type="button"
                    onClick={() => clearSignature(setFieldValue)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-xs"
                  >
                    Clear Signature
                  </button>
                </div>
                <ErrorMessage name="signedWaiver" component="div" className="text-red-500 text-xs mt-0.5" />
                {values.signedWaiver && (
                  <div className="text-green-500 text-xs mt-0.5 flex items-center">
                    <FaCheck className="mr-1" /> Signature captured
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-3">
              <button
                type="button"
                onClick={back}
                className="flex items-center space-x-1 px-3 py-1 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
              >
                <FaArrowLeft />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={!(isValid && dirty) || isSubmitting}
                className={classNames(
                  'flex items-center space-x-1 px-3 py-1 rounded-md text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm',
                  {
                    'bg-green-600 hover:bg-green-700': isValid && dirty && !isSubmitting,
                    'bg-green-300 cursor-not-allowed': !(isValid && dirty) || isSubmitting,
                  }
                )}
                aria-disabled={!(isValid && dirty) || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-1 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit</span>
                    <FaCheckCircle />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </Form>
      )}
    </Formik>
  );
};

// Confirmation Component
const Confirmation = () => (
  <motion.div
    className="bg-white p-2 md:p-4 rounded-lg shadow text-center max-w-sm mx-auto w-full"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <FaCheckCircle className="text-green-600 text-3xl md:text-4xl mx-auto mb-3" />
    <h2 className="text-lg md:text-xl font-bold text-gray-900">Thank You!</h2>
    <p className="text-gray-700 mt-1 text-sm">
      Your registration has been successfully submitted. We look forward to seeing you at the tryout!
    </p>
  </motion.div>
);

// Main MembershipForm Component
export default function MembershipForm() {
  const [formData, setFormData] = useState(loadFormData());
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const steps = [
    { id: 1, name: 'Member Details' },
    { id: 2, name: 'Tryout Selection' },
    { id: 3, name: 'Tryout Waiver' },
  ];

  const next = () => setCurrentStep((prev) => prev + 1);
  const back = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Send SMS if user opted in
        if (formData.agreeToTexts && formData.phone && formData.tryoutType && formData.selectedTrial) {
          await fetch('/api/sendSms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: formData.phone,
              agreeToTexts: formData.agreeToTexts,
              tryoutType: formData.tryoutType,
              selectedTrial: formData.selectedTrial,
            }),
          });
        }

        // Send email with all details
        await fetch('/api/sendEmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        toast.success('Registration successful!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setIsSubmitted(true);
        localStorage.removeItem('membershipFormData');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Server Error. Please try again.', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (error) {
      toast.error('Network Error. Please check your connection.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-100 to-white p-2 md:p-4 font-sans text-gray-700 flex flex-col items-center justify-center min-h-full overflow-x-hidden">
      <div className="max-w-sm sm:max-w-md md:max-w-lg w-full space-y-6">
        <div className="flex items-center space-x-2 justify-center">
          <FaRunning className="text-indigo-600 text-2xl md:text-3xl" />
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">Tryout Registration</h1>
        </div>

        {!isSubmitted && <ProgressIndicator steps={steps} currentStep={currentStep} />}

        <AnimatePresence mode="wait">
          {!isSubmitted && currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <MemberDetailsForm formData={formData} setFormData={setFormData} next={next} />
            </motion.div>
          )}

          {!isSubmitted && currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <TryoutSelectionForm formData={formData} setFormData={setFormData} next={next} back={back} />
            </motion.div>
          )}

          {!isSubmitted && currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <TryoutWaiverForm formData={formData} setFormData={setFormData} next={handleSubmit} back={back} />
            </motion.div>
          )}

          {isSubmitted && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Confirmation />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar />
    </div>
  );
}
