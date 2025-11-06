// "use client"

// import { useState, useEffect } from 'react';
// import { FormField } from '../Data/data';

// interface ValidationResult {
//   error: string;
//   isValid: boolean;
// }

// const useFieldValidation = (field: FormField, value: any): ValidationResult => {
//   const [error, setError] = useState('');

//   useEffect(() => {
//     validateField(field, value);
//   }, [field, value]);

//   const validateField = (field: FormField, value: any) => {
//     let validationError = '';

//     // Check required fields
//     if (field.required) {
//       if (field.type === 'checkbox') {
//         if (!value) {
//           validationError = 'This field is required';
//         }
//       } else if (field.type === 'file') {
//         if (!value) {
//           validationError = 'Please upload a file';
//         }
//       } else {
//         if (!value || value.toString().trim() === '') {
//           validationError = 'This field is required';
//         }
//       }
//     }

//     // Pattern validation
//     if (value && field.validation?.pattern) {
//       const isValid = field.validation.pattern.test(value.toString());
//       if (!isValid) {
//         validationError = field.validation.message || 'Invalid input format';
//       }
//     }

//     // Specific field validations
//     if (value && !validationError) {
//       switch (field.name) {
//         case 'emailAddress':
//           const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//           if (!emailRegex.test(value)) {
//             validationError = 'Please enter a valid email address';
//           }
//           break;

//         case 'mobileNumber':
//           if (value.length !== 10) {
//             validationError = 'Mobile number must be 10 digits';
//           }
//           break;

//         case 'pinCode':
//           if (value.length !== 6 || !/^\d{6}$/.test(value)) {
//             validationError = 'PIN code must be 6 digits';
//           }
//           break;

//         case 'aadharInput':
//           if (value.length !== 12 || !/^\d{12}$/.test(value)) {
//             validationError = 'Aadhar number must be 12 digits';
//           }
//           break;

//         case 'dateOfBirth':
//           const today = new Date();
//           const birthDate = new Date(value);
//           const age = today.getFullYear() - birthDate.getFullYear();

//           if (birthDate > today) {
//             validationError = 'Birth date cannot be in the future';
//           } else if (age < 18) {
//             validationError = 'You must be at least 18 years old';
//           } else if (age > 100) {
//             validationError = 'Please enter a valid birth date';
//           }
//           break;

//         default:
//           break;
//       }
//     }

//     // File validation
//     if (field.type === 'file' && value instanceof File) {
//       // Check file size
//       if (field.maxSize) {
//         const fileSizeMB = value.size / (1024 * 1024);
//         if (fileSizeMB > field.maxSize) {
//           validationError = `File size should not exceed ${field.maxSize}MB`;
//         }
//       }

//       // Check file type
//       if (field.accept) {
//         const acceptedTypes = field.accept.split(',').map(type => type.trim());
//         const fileExtension = '.' + value.name.split('.').pop()?.toLowerCase();
//         const mimeType = value.type;

//         const isValidType = acceptedTypes.some(acceptedType => {
//           if (acceptedType.startsWith('.')) {
//             return acceptedType === fileExtension;
//           } else {
//             return mimeType.startsWith(acceptedType.replace('*', ''));
//           }
//         });

//         if (!isValidType) {
//           validationError = `Please upload a file with one of these formats: ${field.accept}`;
//         }
//       }
//     }

//     setError(validationError);
//   };

//   return {
//     error,
//     isValid: !error
//   };
// };

// export default useFieldValidation;

"use client";

import { useState, useEffect } from "react";
import { FormField } from "../Data/data";

interface ValidationResult {
  error: string;
  isValid: boolean;
}

interface UseFieldValidationOptions {
  validateOnMount?: boolean;
  enabled?: boolean;
  hasExistingData?: boolean;
}

const useFieldValidation = (
  field: FormField,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  value: any,
  options: UseFieldValidationOptions = {},
): ValidationResult => {
  const {
    validateOnMount = false,
    enabled = true,
    hasExistingData = false,
  } = options;

  const [error, setError] = useState("");
  const [hasBeenTouched, setHasBeenTouched] = useState(
    validateOnMount || hasExistingData,
  );

  useEffect(() => {
    // ONLY validate if:
    // 1. Validation is enabled AND
    // 2. (Field has been touched OR has existing data OR validateOnMount is true)
    if (enabled && (hasBeenTouched || hasExistingData || validateOnMount)) {
      validateField(field, value);
    } else {
      // Clear error if not validating
      setError("");
    }
  }, [field, value, enabled, hasBeenTouched, hasExistingData, validateOnMount]);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const validateField = (field: FormField, value: any) => {
    let validationError = "";

    // Check required fields
    if (field.required) {
      if (field.type === "checkbox") {
        if (!value) {
          validationError = "This field is required";
        }
      } else if (field.type === "file") {
        if (!value) {
          validationError = "Please upload a file";
        }
      } else {
        if (!value || value.toString().trim() === "") {
          validationError = "This field is required";
        }
      }
    }

    // Pattern validation
    if (value && field.validation?.pattern && !validationError) {
      const isValid = field.validation.pattern.test(value.toString());
      if (!isValid) {
        validationError = field.validation.message || "Invalid input format";
      }
    }

    // Specific field validations
    if (value && !validationError) {
      const baseFieldName = field.name.replace(/^correspondence_/, "");
      switch (baseFieldName) {
        case "emailAddress":
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            validationError = "Please enter a valid email address";
          }
          break;
        case "mobileNumber":
        case "mobileNo":
          if (value.length !== 10) {
            validationError = "Mobile number must be 10 digits";
          }
          break;
        case "pinCode":
        case "permanentPincode":
        case "correPincode":
          if (value.length !== 6 || !/^\d{6}$/.test(value)) {
            validationError = "PIN code must be 6 digits";
          }
          break;
        case "aadharInput":
        case "aadharNo":
          if (value.length !== 12 || !/^\d{12}$/.test(value)) {
            validationError = "Aadhar number must be 12 digits";
          }
          break;
        case "dateOfBirth":
        case "dob":
          const today = new Date();
          const birthDate = new Date(value);
          const age = today.getFullYear() - birthDate.getFullYear();
          if (birthDate > today) {
            validationError = "Birth date cannot be in the future";
          } else if (age < 18) {
            validationError = "You must be at least 18 years old";
          } else if (age > 100) {
            validationError = "Please enter a valid birth date";
          }
          break;
        default:
          break;
      }
    }

    // File validation
    if (field.type === "file" && value instanceof File) {
      if (field.maxSize) {
        const fileSizeMB = value.size / (1024 * 1024);
        if (fileSizeMB > field.maxSize) {
          validationError = `File size should not exceed ${field.maxSize}MB`;
        }
      }

      if (field.accept) {
        const acceptedTypes = field.accept
          .split(",")
          .map((type) => type.trim());
        const fileExtension = "." + value.name.split(".").pop()?.toLowerCase();
        const mimeType = value.type;
        const isValidType = acceptedTypes.some((acceptedType) => {
          if (acceptedType.startsWith(".")) {
            return acceptedType === fileExtension;
          } else {
            return mimeType.startsWith(acceptedType.replace("*", ""));
          }
        });
        if (!isValidType) {
          validationError = `Please upload a file with one of these formats: ${field.accept}`;
        }
      }
    }

    setError(validationError);
  };

  return {
    error,
    isValid: !error,
  };
};

export default useFieldValidation;
