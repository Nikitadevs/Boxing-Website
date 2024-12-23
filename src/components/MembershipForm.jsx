// src/components/MembershipForm.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  FaTimes,
  FaInfoCircle,
  FaExclamationCircle,
  FaClock,
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

// Setting up the worker for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Custom Hook for Form Persistence
const useFormPersistence = (initialValues, key) => {
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : initialValues;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(formData));
  }, [formData, key]);

  return [formData, setFormData];
};

// Reusable Text Input Component
const TextInput = React.memo(({ label, icon: Icon, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="flex flex-col">
      <label
        htmlFor={props.id || props.name}
        className="text-sm sm:text-base font-medium mb-2 text-gray-200 flex items-center"
      >
        {Icon && <Icon className="mr-2 text-indigo-400 text-lg sm:text-xl" />}
        {label}
      </label>
      <div className="relative">
        <input
          {...field}
          {...props}
          className="border border-indigo-500 rounded-md p-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-gray-200 placeholder-gray-500 w-full text-sm sm:text-base transition duration-150 ease-in-out"
          aria-describedby={`${props.name}-error`}
        />
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-lg sm:text-xl" />
        )}
      </div>
      {meta.touched && meta.error ? (
        <div
          id={`${props.name}-error`}
          className="text-red-500 text-xs sm:text-sm mt-1 flex items-center"
        >
          <FaExclamationCircle className="mr-1" />
          {meta.error}
        </div>
      ) : null}
    </div>
  );
});

// Reusable Select Component
const SelectInput = React.memo(({ label, icon: Icon, children, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="flex flex-col">
      <label
        htmlFor={props.id || props.name}
        className="text-sm sm:text-base font-medium mb-2 text-gray-200 flex items-center"
      >
        {Icon && <Icon className="mr-2 text-indigo-400 text-lg sm:text-xl" />}
        {label}
      </label>
      <div className="relative">
        <Field
          as="select"
          {...field}
          {...props}
          className="border border-indigo-500 rounded-md p-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-gray-200 w-full text-sm sm:text-base transition duration-150 ease-in-out"
          aria-describedby={`${props.name}-error`}
        >
          {children}
        </Field>
      </div>
      {meta.touched && meta.error ? (
        <div
          id={`${props.name}-error`}
          className="text-red-500 text-xs sm:text-sm mt-1 flex items-center"
        >
          <FaExclamationCircle className="mr-1" />
          {meta.error}
        </div>
      ) : null}
    </div>
  );
});

// Reusable Radio Group Component
const RadioGroup = React.memo(({ label, name, options, icon: Icon }) => {
  const [field, meta, helpers] = useField(name);
  const { setValue } = helpers;

  return (
    <div className="flex flex-col">
      <label className="text-sm sm:text-base font-medium mb-2 text-gray-200 flex items-center">
        {Icon && <Icon className="mr-2 text-indigo-400 text-lg sm:text-xl" />}
        {label}
      </label>
      <div
        role="group"
        aria-labelledby={name}
        className="flex flex-col sm:flex-row sm:space-x-6"
      >
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            onClick={() => setValue(option.value)}
            className={classNames(
              'flex items-center justify-center px-4 py-3 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 sm:mb-0',
              {
                'bg-indigo-600 text-white border-transparent':
                  field.value === option.value,
                'bg-gray-700 text-gray-200 border-gray-500 hover:bg-gray-600':
                  field.value !== option.value,
              }
            )}
            aria-pressed={field.value === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
      {meta.touched && meta.error ? (
        <div
          id={`${name}-error`}
          className="text-red-500 text-xs sm:text-sm mt-1 flex items-center"
        >
          <FaExclamationCircle className="mr-1" />
          {meta.error}
        </div>
      ) : null}
    </div>
  );
});

// Reusable Checkbox Component
const Checkbox = React.memo(({ children, ...props }) => {
  const [field, meta] = useField({ ...props, type: 'checkbox' });
  return (
    <div className="flex items-center mt-4">
      <input
        {...field}
        {...props}
        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-indigo-500 rounded"
        aria-checked={field.value}
      />
      <label
        htmlFor={props.id || props.name}
        className="ml-3 text-sm sm:text-base text-gray-200"
      >
        {children}
      </label>
      {meta.touched && meta.error ? (
        <div className="text-red-500 text-xs sm:text-sm mt-1 ml-8 flex items-center">
          <FaExclamationCircle className="mr-1" />
          {meta.error}
        </div>
      ) : null}
    </div>
  );
});

// Custom Input Component for DatePicker
const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
  <div className="relative">
    <input
      type="text"
      onClick={onClick}
      value={value}
      placeholder={placeholder}
      ref={ref}
      className="border border-indigo-500 rounded-md p-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-800 text-gray-200 placeholder-gray-500 w-full text-sm sm:text-base transition duration-150 ease-in-out"
      readOnly
      aria-label="Date Picker"
    />
    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-lg sm:text-xl" />
  </div>
));
CustomInput.displayName = 'CustomInput';

// Custom DatePicker Component
const CustomDatePicker = React.memo(({ label, ...props }) => {
  const [field, meta, helpers] = useField(props);
  const { setValue } = helpers;

  return (
    <div className="flex flex-col">
      <label
        htmlFor={props.name}
        className="text-sm sm:text-base font-medium mb-2 text-gray-200 flex items-center"
      >
        <FaCalendarAlt className="mr-2 text-indigo-400 text-lg sm:text-xl" />
        {label}
      </label>
      <div className="relative">
        <DatePicker
          {...field}
          {...props}
          selected={(field.value && new Date(field.value)) || null}
          onChange={(val) => setValue(val)}
          dateFormat="MM/dd/yyyy"
          customInput={<CustomInput />}
          placeholderText="Select a date"
          minDate={props.minDate || undefined}
          maxDate={props.maxDate || undefined}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          className="w-full"
        />
        {field.value && (
          <button
            type="button"
            onClick={() => setValue(null)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none"
            aria-label="Clear date"
          >
            <FaTimes />
          </button>
        )}
      </div>
      {meta.touched && meta.error ? (
        <div
          id={`${props.name}-error`}
          className="text-red-500 text-xs sm:text-sm mt-1 flex items-center"
        >
          <FaExclamationCircle className="mr-1" />
          {meta.error}
        </div>
      ) : null}
    </div>
  );
});

// Progress Indicator Component
const ProgressIndicator = React.memo(({ steps, currentStep }) => (
  <div
    className="flex items-center mb-8 space-x-2 sm:space-x-4 lg:space-x-6"
    aria-label="Progress Indicator"
  >
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <div
            className={classNames(
              'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border-2 transition-colors duration-300 relative',
              {
                'bg-green-500 border-green-500 text-white': currentStep > index + 1,
                'bg-indigo-600 border-indigo-600 text-white': currentStep === index + 1,
                'bg-transparent border-gray-300 text-gray-500': currentStep < index + 1,
              }
            )}
            aria-current={currentStep === index + 1 ? 'step' : undefined}
            aria-label={`Step ${index + 1}: ${step.name}`}
          >
            {currentStep > index + 1 ? <FaCheck /> : index + 1}
          </div>
          <span className="mt-2 text-xs sm:text-sm lg:text-base text-gray-300">
            {step.name}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div
            className={classNames('flex-1 h-1 transition-colors duration-300', {
              'bg-green-500': currentStep > index + 1,
              'bg-gray-300': currentStep <= index + 1,
            })}
            aria-hidden="true"
          ></div>
        )}
      </React.Fragment>
    ))}
  </div>
));

// STEP 1: Member Details Form
const MemberDetailsForm = ({ formData, setFormData, next }) => {
  const phoneRegExp = /^\(\d{3}\) \d{3}-\d{4}$/;

  const validationSchema = Yup.object({
    firstName: Yup.string().required('First Name is required.'),
    lastName: Yup.string().required('Last Name is required.'),
    gender: Yup.string().required('Gender is required.'),
    email: Yup.string().email('Invalid email address.').required('Email is required.'),
    phone: Yup.string()
      .matches(phoneRegExp, 'Phone number must be in the format (555) 555-5555.')
      .required('Phone number is required.'),
    dob: Yup.date()
      .max(new Date(Date.now() - 567648000000), 'You must be at least 18 years old.')
      .required('Date of Birth is required.'),
    agreeToTexts: Yup.boolean(),
  });

  return (
    <Formik
      initialValues={formData}
      enableReinitialize={true} // Enable reinitialization
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log('Member Details Submitted:', values); // Debug log
        setFormData((prevData) => ({ ...prevData, ...values })); // Merge data
        next();
      }}
    >
      {({ isValid, dirty, setFieldValue, values }) => (
        <Form className="h-full">
          <motion.div
            className="bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-xl shadow-lg space-y-6 max-w-3xl mx-auto w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center justify-center">
              <FaUser className="mr-3 text-indigo-400 text-2xl sm:text-3xl lg:text-4xl" />
              Member Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <TextInput
                label="First Name"
                name="firstName"
                type="text"
                placeholder="John"
                icon={FaUser}
              />
              <TextInput
                label="Last Name"
                name="lastName"
                type="text"
                placeholder="Doe"
                icon={FaUser}
              />
              <SelectInput label="Gender" name="gender" icon={FaUser}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </SelectInput>
              <TextInput
                label="Email"
                name="email"
                type="email"
                placeholder="john.doe@example.com"
                icon={FaEnvelope}
              />

              {/* Phone Input with format */}
              <div className="flex flex-col">
                <label
                  htmlFor="phone"
                  className="text-sm sm:text-base font-medium mb-2 text-gray-200 flex items-center"
                >
                  <FaPhone className="mr-2 text-indigo-400 text-lg sm:text-xl" />
                  Phone
                </label>
                <Field
                  type="tel"
                  name="phone"
                  id="phone"
                  placeholder="(555) 555-5555"
                  className="border border-indigo-500 rounded-md p-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-gray-200 text-sm sm:text-base transition duration-150 ease-in-out"
                  aria-required="true"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    const formattedPhone = val
                      ? `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6, 10)}`
                      : '';
                    setFieldValue('phone', formattedPhone);
                    // Removed setFormData to prevent conflicts
                  }}
                />
                {/* Fixed ErrorMessage usage */}
                <ErrorMessage name="phone">
                  {(msg) => (
                    <div className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                      <FaExclamationCircle className="mr-1" />
                      {msg}
                    </div>
                  )}
                </ErrorMessage>
                <small className="text-xs sm:text-sm text-gray-400">
                  Format: (555) 555-5555
                </small>
              </div>

              {/* DOB */}
              <div className="flex flex-col sm:col-span-3 lg:col-span-3">
                <CustomDatePicker
                  label="Date of Birth"
                  name="dob"
                  id="dob"
                  aria-required="true"
                />
              </div>
            </div>

            <Checkbox name="agreeToTexts">Receive text confirmations</Checkbox>

            {/* Next Button */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={!isValid || !dirty}
                className={classNames(
                  'flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base lg:text-lg',
                  {
                    'bg-indigo-600 hover:bg-indigo-700': isValid && dirty,
                    'bg-indigo-400 cursor-not-allowed': !isValid || !dirty,
                  }
                )}
                aria-disabled={!isValid || !dirty}
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

// STEP 2: Tryout Selection Form
const TryoutSelectionForm = ({ formData, setFormData, next, back }) => {
  // Structured Training Schedule with Boxing and Kickboxing Sessions
  const trainingSchedule = [
    {
      group: 'Kids Group',
      sessions: [
        { name: 'Friday Session', day: 'Friday', time: '5:00 PM', duration: '1 hour', activityType: 'boxing' },
        { name: 'Thursday Session', day: 'Thursday', time: '5:00 PM', duration: '1 hour', activityType: 'boxing' },
        { name: 'Saturday Session', day: 'Saturday', time: '2:30 PM', duration: '1 hour', activityType: 'boxing' },
      ],
    },
    {
      group: 'Adults Beginner',
      sessions: [
        { name: 'Monday Session', day: 'Monday', time: '6:30 PM', duration: '1 hour', activityType: 'boxing' },
        { name: 'Wednesday Session', day: 'Wednesday', time: '6:30 PM', duration: '1 hour', activityType: 'boxing' },
        { name: 'Kickboxing', day: 'Wednesday', time: '7:00 PM', duration: '1 hour', activityType: 'kickboxing' },
        { name: 'Saturday Session', day: 'Saturday', time: '10:30 AM', duration: '1 hour', activityType: 'boxing' },
      ],
    },
    {
      group: 'Adults Professional',
      sessions: [
        { name: 'Monday Session', day: 'Monday', time: '7:30 PM', duration: '1.5 hours', activityType: 'boxing' },
        { name: 'Wednesday Session', day: 'Wednesday', time: '7:30 PM', duration: '1.5 hours', activityType: 'boxing' },
        { name: 'Kickboxing', day: 'Friday', time: '7:00 PM', duration: '1.5 hours', activityType: 'kickboxing' },
        { name: 'Saturday Session', day: 'Saturday', time: '11:30 AM', duration: '1.5 hours', activityType: 'boxing' },
      ],
    },
  ];

  // Flatten for easy selection
  const trials = trainingSchedule.flatMap((group) =>
    group.sessions.map((session) => ({
      group: group.group,
      name: session.name,
      day: session.day,
      time: session.time,
      duration: session.duration,
      display: `${group.group} - ${session.day}, ${session.time} (${session.duration})`,
      activityType: session.activityType, // 'boxing' or 'kickboxing'
    }))
  );

  // Validation Schema
  const validationSchema = Yup.object({
    tryoutType: Yup.string().required('Please select a tryout type.'),
    groupType: Yup.string().when('tryoutType', {
      is: 'Doubles',
      then: Yup.string().required('Please select a group.'),
      otherwise: Yup.string().notRequired(),
    }),
    activityType: Yup.string().when(['tryoutType', 'groupType'], {
      is: (tryoutType, groupType) =>
        tryoutType === 'Doubles' &&
        (groupType === 'Adults Beginner' || groupType === 'Adults Professional'),
      then: Yup.string().required('Please select an activity type.'),
      otherwise: Yup.string().notRequired(),
    }),
    selectedTrial: Yup.string().when('tryoutType', {
      is: 'Doubles',
      then: Yup.string().required('Please select a training session.'),
      otherwise: Yup.string().notRequired(),
    }),
    customDate: Yup.date().when('tryoutType', {
      is: 'Individual',
      then: Yup.date()
        .required('Please select a date.')
        .min(new Date(), 'Date cannot be in the past.'),
      otherwise: Yup.date().notRequired(),
    }),
    customTime: Yup.string().when('tryoutType', {
      is: 'Individual',
      then: Yup.string().required('Please select a time.'),
      otherwise: Yup.string().notRequired(),
    }),
  });

  // Custom DatePicker for Individual Tryout Type
  const IndividualDatePicker = React.memo(({ label, ...props }) => {
    const [field, meta, helpers] = useField(props);
    const { setValue } = helpers;

    return (
      <div className="flex flex-col">
        <label
          htmlFor={props.name}
          className="text-sm sm:text-base font-medium mb-2 text-gray-200 flex items-center"
        >
          <FaCalendarAlt className="mr-2 text-indigo-400 text-lg sm:text-xl" />
          {label}
        </label>
        <div className="relative">
          <DatePicker
            {...field}
            {...props}
            selected={(field.value && new Date(field.value)) || null}
            onChange={(val) => setValue(val)}
            dateFormat="MM/dd/yyyy"
            customInput={<CustomInput />}
            placeholderText="Select a date"
            minDate={new Date()}
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            className="border border-indigo-500 rounded-md p-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-gray-200 placeholder-gray-500 w-full text-sm sm:text-base transition duration-150 ease-in-out"
          />
          {field.value && (
            <button
              type="button"
              onClick={() => setValue(null)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none"
              aria-label="Clear date"
            >
              <FaTimes />
            </button>
          )}
        </div>
        {meta.touched && meta.error ? (
          <div
            id={`${props.name}-error`}
            className="text-red-500 text-xs sm:text-sm mt-1 flex items-center"
          >
            <FaExclamationCircle className="mr-1" />
            {meta.error}
          </div>
        ) : null}
      </div>
    );
  });

  // Custom TimePicker Component
  const TimePicker = React.memo(({ label, ...props }) => {
    const [field, meta, helpers] = useField(props);
    const { setValue } = helpers;

    return (
      <div className="flex flex-col">
        <label
          htmlFor={props.name}
          className="text-sm sm:text-base font-medium mb-2 text-gray-200 flex items-center"
        >
          <FaClock className="mr-2 text-indigo-400 text-lg sm:text-xl" />
          {label}
        </label>
        <div className="relative">
          <input
            type="time"
            {...field}
            {...props}
            onChange={(e) => setValue(e.target.value)}
            className="border border-indigo-500 rounded-md p-3 pl-3 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-700 text-gray-200 w-full text-sm sm:text-base transition duration-150 ease-in-out"
          />
        </div>
        {meta.touched && meta.error ? (
          <div
            id={`${props.name}-error`}
            className="text-red-500 text-xs sm:text-sm mt-1 flex items-center"
          >
            <FaExclamationCircle className="mr-1" />
            {meta.error}
          </div>
        ) : null}
      </div>
    );
  });

  // Handle Session Click
  const handleSessionClick = (trial, setFieldValue) => {
    setFieldValue('selectedTrial', trial.display);
    console.log('Selected Trial:', trial.display);
  };

  return (
    <Formik
      initialValues={formData}
      enableReinitialize={true} // Enable reinitialization
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log('Tryout Selection Submitted:', values); // Debug log
        setFormData((prevData) => ({ ...prevData, ...values })); // Merge data
        next();
      }}
    >
      {({ values, isValid, dirty, setFieldValue }) => {
        // Debugging Logs
        console.log('Current Values:', values);
        console.log('Is Valid:', isValid);
        console.log('Dirty:', dirty);

        // Filter trials based on groupType and activityType
        const filteredTrials = trials.filter((trial) => {
          if (values.tryoutType !== 'Doubles') return false;
          if (trial.group !== values.groupType) return false;
          if (
            (values.groupType === 'Adults Beginner' ||
              values.groupType === 'Adults Professional')
          ) {
            if (values.activityType === 'boxing') {
              // Include all boxing sessions
              return trial.activityType === 'boxing';
            } else if (values.activityType === 'kickboxing') {
              // Include only Kickboxing sessions
              return trial.activityType === 'kickboxing';
            }
          }
          // For Kids Group, include all boxing sessions
          return trial.activityType === 'boxing';
        });

        console.log('Filtered Trials:', filteredTrials); // Debug log

        return (
          <Form className="h-full">
            <motion.div
              className="bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-xl shadow-lg space-y-6 max-w-3xl mx-auto w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center justify-center">
                <FaRunning className="mr-3 text-indigo-400 text-2xl sm:text-3xl lg:text-4xl" />
                Training Session Selection
              </h2>

              {/* Tryout Type Buttons */}
              <div className="flex flex-col">
                <label className="text-sm sm:text-base font-medium mb-2 text-gray-200 flex items-center">
                  <FaInfoCircle className="mr-2 text-indigo-400 text-lg sm:text-xl" />
                  Tryout Type
                </label>
                <div className="flex flex-col sm:flex-row sm:space-x-4 lg:space-x-6">
                  {[
                    {
                      value: 'Individual',
                      label: 'Individual',
                      icon: FaUser,
                      description: 'Train individually with personalized coaching.',
                    },
                    {
                      value: 'Doubles',
                      label: 'Doubles',
                      icon: FaCheckCircle,
                      description: 'Partner up and train in doubles format.',
                    },
                  ].map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => {
                        setFieldValue('tryoutType', option.value);
                        // Reset dependent fields when tryout type changes
                        setFieldValue('groupType', '');
                        setFieldValue('activityType', '');
                        setFieldValue('selectedTrial', '');
                        setFieldValue('customDate', '');
                        setFieldValue('customTime', '');
                      }}
                      className={classNames(
                        'flex flex-col items-center justify-center px-4 py-3 rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 sm:mb-0',
                        {
                          'bg-indigo-600 text-white border-transparent':
                            values.tryoutType === option.value,
                          'bg-gray-700 text-gray-200 border-gray-500 hover:bg-gray-600':
                            values.tryoutType !== option.value,
                        }
                      )}
                      aria-pressed={values.tryoutType === option.value}
                    >
                      {option.icon && <option.icon className="text-2xl mb-1 sm:text-3xl lg:text-4xl" />}
                      <span className="font-semibold text-sm sm:text-base lg:text-lg">
                        {option.label}
                      </span>
                      <span className="text-xs sm:text-sm text-center mt-1">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
                <ErrorMessage name="tryoutType">
                  {(msg) => (
                    <div className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                      <FaExclamationCircle className="mr-1" />
                      {msg}
                    </div>
                  )}
                </ErrorMessage>
              </div>

              {/* Conditional Rendering Based on Tryout Type */}
              {values.tryoutType === 'Doubles' && (
                <>
                  {/* Group Type */}
                  <RadioGroup
                    label="Group"
                    name="groupType"
                    options={[
                      { value: 'Kids Group', label: 'Kids Group' },
                      { value: 'Adults Beginner', label: 'Adults Beginner' },
                      { value: 'Adults Professional', label: 'Adults Professional' },
                    ]}
                    icon={FaCheckCircle}
                  />

                  {/* Activity Type Selection */}
                  {(values.groupType === 'Adults Beginner' || values.groupType === 'Adults Professional') && (
                    <>
                      <RadioGroup
                        label="Activity Type"
                        name="activityType"
                        options={[
                          { value: 'boxing', label: 'Boxing' },
                          { value: 'kickboxing', label: 'Kickboxing' },
                        ]}
                        icon={FaCheckCircle}
                      />
                      <ErrorMessage name="activityType">
                        {(msg) => (
                          <div className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                            <FaExclamationCircle className="mr-1" />
                            {msg}
                          </div>
                        )}
                      </ErrorMessage>
                    </>
                  )}

                  {/* Training Session List */}
                  {values.groupType && (
                    <div className="flex flex-col">
                      <label className="text-sm sm:text-base font-medium mb-2 text-gray-200">
                        Select a Training Session
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTrials.length > 0 ? (
                          filteredTrials.map((trial, index) => (
                            <div
                              key={index}
                              className={classNames(
                                'border rounded-lg p-4 sm:p-6 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 relative',
                                {
                                  'bg-gradient-to-r from-indigo-500 to-purple-600 border-transparent text-white':
                                    values.selectedTrial === trial.display,
                                  'bg-gray-700 border-gray-600 text-gray-200':
                                    values.selectedTrial !== trial.display,
                                }
                              )}
                              onClick={() => handleSessionClick(trial, setFieldValue)}
                              role="button"
                              tabIndex={0}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  handleSessionClick(trial, setFieldValue);
                                }
                              }}
                              aria-pressed={values.selectedTrial === trial.display}
                              aria-label={trial.display}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold sm:text-xl">
                                    {trial.name}
                                  </h3>
                                  <p className="text-sm sm:text-base">{trial.day}</p>
                                  {values.activityType !== 'kickboxing' && (
                                    <p className="text-sm sm:text-base">{trial.time}</p>
                                  )}
                                  <p className="text-sm sm:text-base">{`Duration: ${trial.duration}`}</p>
                                  <p className="text-sm sm:text-base text-green-400">Cost: Free</p>
                                </div>
                                {values.selectedTrial === trial.display && (
                                  <FaCheck className="text-green-400 text-xl sm:text-2xl" />
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm sm:text-base">
                            No sessions available for the selected group and activity type.
                          </p>
                        )}
                      </div>
                      <ErrorMessage name="selectedTrial">
                        {(msg) => (
                          <div className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                            <FaExclamationCircle className="mr-1" />
                            {msg}
                          </div>
                        )}
                      </ErrorMessage>
                    </div>
                  )}
                </>
              )}

              {values.tryoutType === 'Individual' && (
                <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  {/* Custom Date Picker */}
                  <IndividualDatePicker
                    label="Select Date"
                    name="customDate"
                    id="customDate"
                    aria-required="true"
                  />

                  {/* Custom Time Picker */}
                  <TimePicker
                    label="Select Time"
                    name="customTime"
                    id="customTime"
                    aria-required="true"
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
                <button
                  type="button"
                  onClick={back}
                  className="flex items-center justify-center space-x-2 px-5 py-3 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <FaArrowLeft />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={!isValid} // Removed 'dirty' condition
                  className={classNames(
                    'flex items-center justify-center space-x-2 px-5 py-3 rounded-md text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base lg:text-lg',
                    {
                      'bg-indigo-600 hover:bg-indigo-700': isValid,
                      'bg-indigo-400 cursor-not-allowed': !isValid,
                    }
                  )}
                  aria-disabled={!isValid}
                >
                  <span>Next</span>
                  <FaArrowRight />
                </button>
              </div>
            </motion.div>
          </Form>
        );
      }}
    </Formik>
  );
};

// STEP 3: Waiver Form
const TryoutWaiverForm = ({ formData, setFormData, next, back }) => {
  const [numPages, setNumPages] = useState(null);
  const sigCanvasRef = useRef({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationSchema = Yup.object({
    signedWaiver: Yup.string().required('You must sign the waiver.'),
    hasReadWaiver: Yup.boolean()
      .oneOf([true], 'You must confirm that you have read the waiver.')
      .required('You must confirm that you have read the waiver.'),
  });

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const clearSignature = useCallback((setFieldValue) => {
    sigCanvasRef.current.clear();
    setFieldValue('signedWaiver', '');
    toast.info('Signature cleared.', {
      position: 'top-right',
      autoClose: 3000,
    });
  }, []);

  const handleSubmitForm = async (values) => {
    console.log('Waiver Form Submitted:', values); // Debug log
    setIsSubmitting(true);
    setFormData((prevData) => ({ ...prevData, ...values })); // Merge data
    // Simulate API call delay
    setTimeout(() => {
      next();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Formik
      initialValues={{
        signedWaiver: formData.signedWaiver || '',
        hasReadWaiver: formData.hasReadWaiver || false,
      }}
      enableReinitialize={true} // Enable reinitialization
      validationSchema={validationSchema}
      onSubmit={handleSubmitForm}
    >
      {({ setFieldValue, isValid, dirty, values }) => (
        <Form className="h-full">
          <motion.div
            className="bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-xl shadow-lg space-y-6 max-w-3xl mx-auto w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center justify-center">
              <FaCheckCircle className="mr-3 text-green-500 text-2xl sm:text-3xl lg:text-4xl" />
              Waiver Agreement
            </h2>

            {/* Make waiver area scrollable */}
            <div className="flex flex-col items-center w-full">
              <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl overflow-y-auto max-h-80 rounded-lg shadow-inner mb-6">
                <Document
                  file="/waiver.pdf" // Ensure this path points to your actual waiver PDF
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="rounded-lg"
                  loading={
                    <div className="flex justify-center items-center h-40">
                      <svg
                        className="animate-spin h-8 w-8 text-indigo-500"
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
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      width={600}
                      className="mb-4 mx-auto"
                    />
                  ))}
                </Document>
              </div>

              <div className="flex items-center mb-4 w-full max-w-md sm:max-w-lg lg:max-w-2xl">
                <Checkbox name="hasReadWaiver">
                  I have read and understood the waiver.
                </Checkbox>
              </div>

              <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl">
                <label className="text-sm sm:text-base font-medium mb-2 text-gray-200 block">
                  Signature <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <SignatureCanvas
                    penColor="white"
                    canvasProps={{
                      width: '100%',
                      height: 200,
                      className: 'border border-indigo-500 rounded-lg bg-gray-700',
                    }}
                    ref={sigCanvasRef}
                    onEnd={() => {
                      const trimmedDataURL = sigCanvasRef.current
                        .getTrimmedCanvas()
                        .toDataURL('image/png');
                      setFieldValue('signedWaiver', trimmedDataURL);
                      console.log('Signature Captured:', trimmedDataURL); // Debug log
                    }}
                    clearOnResize={false}
                  />
                  {!values.signedWaiver && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-gray-400 text-xs sm:text-sm">
                        Sign here
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-4 mt-3">
                  <button
                    type="button"
                    onClick={() => clearSignature(setFieldValue)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-xs sm:text-sm"
                  >
                    Clear Signature
                  </button>
                </div>
                <ErrorMessage name="signedWaiver">
                  {(msg) => (
                    <div className="text-red-500 text-xs sm:text-sm mt-2 flex items-center">
                      <FaExclamationCircle className="mr-1" />
                      {msg}
                    </div>
                  )}
                </ErrorMessage>
                {values.signedWaiver && (
                  <div className="text-green-500 text-xs sm:text-sm mt-2 flex items-center">
                    <FaCheck className="mr-1" /> Signature captured
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between">
              <button
                type="button"
                onClick={back}
                className="flex items-center space-x-2 px-5 py-3 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4 sm:mb-0"
              >
                <FaArrowLeft />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={!isValid || !dirty || isSubmitting}
                className={classNames(
                  'flex items-center justify-center space-x-2 px-6 py-3 rounded-md text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base lg:text-lg',
                  {
                    'bg-green-600 hover:bg-green-700': isValid && dirty && !isSubmitting,
                    'bg-green-400 cursor-not-allowed': !isValid || !dirty || isSubmitting,
                  }
                )}
                aria-disabled={!isValid || !dirty || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
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
const Confirmation = React.memo(() => (
  <motion.div
    className="bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-xl shadow-lg text-center max-w-3xl mx-auto w-full"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
  >
    <FaCheckCircle className="text-green-500 text-4xl sm:text-5xl lg:text-6xl mx-auto mb-6" />
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Thank You!</h2>
    <p className="text-gray-300 mt-4 text-base sm:text-lg lg:text-xl">
      Your registration has been successfully submitted. We look forward to
      seeing you at the tryout!
    </p>
  </motion.div>
));

// Main MembershipForm Component
export default function MembershipForm() {
  const initialFormValues = {
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    email: '',
    dob: '',
    agreeToTexts: false,
    tryoutType: '',
    groupType: '',
    activityType: '', // New field for Boxing/Kickboxing
    selectedTrial: '',
    signedWaiver: '',
    hasReadWaiver: false,
    customDate: '',
    customTime: '',
  };

  const [formData, setFormData] = useFormPersistence(
    initialFormValues,
    'membershipFormData'
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const steps = [
    { id: 1, name: 'Member Details' },
    { id: 2, name: 'Tryout Selection' },
    { id: 3, name: 'Waiver Agreement' },
  ];

  const next = useCallback(() => {
    setCurrentStep((prev) => {
      const newStep = prev + 1;
      if (newStep > steps.length) {
        console.warn(`Attempted to exceed the maximum step: ${steps.length}`);
        return prev;
      }
      console.log(`Moving to step ${newStep}`); // Debug log
      return newStep;
    });
  }, [steps.length]);

  const back = useCallback(() => {
    setCurrentStep((prev) => {
      const newStep = prev - 1;
      if (newStep < 1) {
        console.warn('Attempted to go below step 1');
        return prev;
      }
      console.log(`Moving back to step ${newStep}`); // Debug log
      return newStep;
    });
  }, []);

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Send SMS if user opted in
        if (
          formData.agreeToTexts &&
          formData.phone &&
          formData.tryoutType &&
          (formData.selectedTrial ||
            (formData.tryoutType === 'Individual' &&
              formData.customDate &&
              formData.customTime))
        ) {
          await fetch('/api/sendSms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: formData.phone,
              agreeToTexts: formData.agreeToTexts,
              tryoutType: formData.tryoutType,
              selectedTrial: formData.selectedTrial,
              activityType: formData.activityType, // Include activity type
              customDate: formData.customDate,
              customTime: formData.customTime,
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
    // Allow scrolling on smaller screens with overflow-auto.
    <div className="bg-gray-900 min-h-screen flex items-center justify-center p-4 overflow-auto sm:overflow-hidden">
      <div className="w-full max-w-4xl h-full">
        {/* Title */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-3 justify-center mb-10">
          <FaRunning className="text-indigo-500 text-4xl sm:text-5xl lg:text-6xl" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Tryout Registration
          </h1>
        </div>

        {!isSubmitted && <ProgressIndicator steps={steps} currentStep={currentStep} />}

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {!isSubmitted && currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <MemberDetailsForm
                formData={formData}
                setFormData={setFormData}
                next={next}
              />
            </motion.div>
          )}

          {/* STEP 2 */}
          {!isSubmitted && currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <TryoutSelectionForm
                formData={formData}
                setFormData={setFormData}
                next={next}
                back={back}
              />
            </motion.div>
          )}

          {/* STEP 3 (WAIVER) */}
          {!isSubmitted && currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <TryoutWaiverForm
                formData={formData}
                setFormData={setFormData}
                next={handleSubmit}
                back={back}
              />
            </motion.div>
          )}

          {/* CONFIRMATION */}
          {isSubmitted && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
