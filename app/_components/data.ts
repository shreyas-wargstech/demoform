export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "tel"
    | "date"
    | "select"
    | "file"
    | "checkbox"
    | "radio";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  accept?: string; // for file inputs
  maxSize?: number; // for file inputs in MB
  multiple?: boolean; // for file inputs
  validation?: {
    pattern?: RegExp;
    message?: string;
  };

  inputProps?: any;
  row?: boolean;
  disabled?: boolean; // ADD THIS LINE
}

export interface AccordionStep {
  id: string;
  title: string;
  stepNumber: number;
  fields: FormField[];
  completed?: boolean;
}

export const STATIC_OTP_CONFIG = {
  OTP_VALUE: "1234", // Static OTP for demo
  OTP_LENGTH: 4,
  EXPIRY_TIME: 300, // 5 minutes in seconds
  MOBILE_NUMBER: "******9012", // Masked mobile number for display
};

export const formStepsData: AccordionStep[] = [
  {
    id: "personal-information",
    title: "Personal Information",
    stepNumber: 1,
    fields: [
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        required: true,
        placeholder: "Enter first name",
      },
      {
        name: "middleName",
        label: "Middle Name",
        type: "text",
        placeholder: "Enter middle name",
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        required: true,
        placeholder: "Enter last name",
      },
      {
        name: "gender",
        label: "Gender",
        type: "select",
        required: true,
        options: [
          { value: "Male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "dob",
        label: "Date Of Birth",
        type: "date",
        required: true,
      },
      {
        name: "nationality",
        label: "Nationality",
        type: "select",
        required: true,
        options: [
          { value: "indian", label: "Indian" },
          { value: "other", label: "Other" },
        ],
      },
      {
        name: "maritalStatus",
        label: "Marital Status",
        type: "select",
        required: true,
        options: [
          { value: "Single", label: "Single" },
          { value: "married", label: "Married" },
        ],
      },
      {
        name: "mobileNo",
        label: "Mobile Number",
        type: "tel",
        required: true,
        placeholder: "X X X X X X X X X X",
        validation: {
          pattern: /^\d{10}$/,
          message: "Mobile number must be 10 digits",
        },
      },
      {
        name: "email",
        label: "Email Address",
        type: "email",
        required: true,
        placeholder: "example@gmail.com",
      },
      {
        name: "motherName",
        label: "Mother's Name",
        type: "text",
        required: true,
      },
      {
        name: "fatherName",
        label: "Father's Name",
        type: "text",
        required: true,
      },
    ],
  },
  {
    id: "address",
    title: "Address",
    stepNumber: 2,
    fields: [
      // Permanent Address Fields
      {
        name: "permanentStreet",
        label: "Street",
        type: "text",
        required: true,
        placeholder: "Enter street address",
      },
      {
        name: "permanentArea",
        label: "Area",
        type: "text",
        required: true,
        placeholder: "Enter Area",
      },
      {
        name: "permanentCity",
        label: "City",
        type: "text",
        required: true,
        placeholder: "Enter city",
      },
      {
        name: "permanentDistrict",
        label: "District",
        type: "text",
        required: true,
        placeholder: "Enter District",
      },
      {
        name: "permanentState",
        label: "State",
        type: "text",
        required: true,
        placeholder: "Enter State",
      },
      {
        name: "permanentPincode",
        label: "PIN Code",
        type: "text",
        required: true,
        placeholder: "Enter PIN Code",
      },
      // Correspondence Address Fields
      {
        name: "correStreet",
        label: "Street",
        type: "text",
        required: true,
        placeholder: "Enter street address",
      },
      {
        name: "correArea",
        label: "Area",
        type: "text",
        required: true,
        placeholder: "Enter Area",
      },
      {
        name: "correCity",
        label: "City",
        type: "text",
        required: true,
        placeholder: "Enter city",
      },
      {
        name: "correDistrict",
        label: "District",
        type: "text",
        required: true,
        placeholder: "Enter District",
      },
      {
        name: "correState",
        label: "State",
        type: "text",
        required: true,
        placeholder: "Enter State",
      },
      {
        name: "correPincode",
        label: "PIN Code",
        type: "text",
        required: true,
        placeholder: "Enter PIN Code",
      },
    ],
  },
  {
    id: "qualifications",
    title: "Qualifications",
    stepNumber: 3,
    fields: [
      {
        name: "degreeName",
        label: "Name of Degree",
        type: "select",
        required: true,
        placeholder: "select your degree",
        options: [
          { value: "bachelor", label: "Bachelor" },
          { value: "master", label: "Master" },
          { value: "phd", label: "PhD" },
        ],
      },
      {
        name: "collegeName",
        label: "Name Of College",
        type: "select",
        required: true,
        placeholder: "Select college name",
        options: [
          { value: "A", label: "A" },
          { value: "B", label: "B" },
          { value: "C", label: "C" },
        ],
      },
      {
        name: "universityName",
        label: "University Name",
        type: "select",
        required: true,
        placeholder: "Select university name",
        options: [
          { value: "A", label: "A" },
          { value: "B", label: "B" },
          { value: "C", label: "C" },
        ],
      },
      {
        name: "yearOfAdmission",
        label: "Year of Admission",
        type: "text",
        required: true,
        placeholder: "select admission year",
        options: [
          { value: "2021", label: "2021" },
          { value: "2022", label: "2022" },
          { value: "2023", label: "2023" },
        ],
      },
      {
        name: "yearOfPassing",
        label: "Year of Passing",
        type: "text",
        required: true,
        placeholder: "select passing year",
        options: [
          { value: "2021", label: "2021" },
          { value: "2022", label: "2022" },
          { value: "2023", label: "2023" },
        ],
      },
      {
        name: "rollNo",
        label: "Roll Number",
        type: "text",
        required: true,
        placeholder: "Enter roll number",
      },
      {
        name: "internship",
        label: "Internship Status",
        type: "select",
        required: true,
        options: [
          { value: "completed", label: "Completed" },
          { value: "ongoing", label: "Ongoing" },
          { value: "not-started", label: "Not Started" },
        ],
      },
    ],
  },
  {
    id: "upload-documents",
    title: "Upload documents",
    stepNumber: 4,
    fields: [
      {
        name: "tenthMarksheet",
        label: "10th Marksheet",
        type: "file",
        // required: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
      },
      {
        name: "twelfthMarksheet",
        label: "12th Marksheet",
        type: "file",
        // required: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
      },
      {
        name: "finalYearMarksheet",
        label: "Final Year Marksheet",
        type: "file",
        // required: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
      },
      {
        name: "collegeLeaving",
        label: "College Leaving / Transfer Certificate",
        type: "file",
        // required: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
      },
      {
        name: "attemptCertificate",
        label: "Attempt Certificate",
        type: "file",
        // required: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
      },
      {
        name: "internshipCertificate",
        label: "Internship Completion Certificate (if applicable)",
        type: "file",
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
      },
      {
        name: "photo",
        label: "Passport Size Photograph",
        type: "file",
        // required: true,
        accept: ".jpg,.jpeg,.png",
        maxSize: 1,
      },
      {
        name: "signature",
        label: "Scanned Signature",
        type: "file",
        // required: true,
        accept: ".jpg,.jpeg,.png",
        maxSize: 1,
      },
      {
        name: "idProof",
        label: "Valid ID Proof (Aadhar / PAN / Driving License)",
        type: "file",
        // required: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
      },
      {
        name: "nationalityCertificate",
        label: "Domicile/Nationality Certificate (if applicable)",
        type: "file",
        accept: ".pdf,.jpg,.jpeg,.png",
        maxSize: 2,
      },
    ],
  },
  {
    id: "aadhar-verification",
    title: "Aadhar Verification",
    stepNumber: 5,
    fields: [
      {
        name: "verificationMethod",
        label: "Select Verification Method",
        type: "radio",
        required: true,
        options: [
          { value: "aadhar-number", label: "Aadhar Number" },
          { value: "virtual-id", label: "Virtual ID (VID)" },
        ],
      },
      {
        name: "aadharNo",
        label: "Aadhar Number",
        type: "text",
        required: true,
        placeholder: "Enter 12-digit Aadhar number",
        validation: {
          pattern: /^\d{12}$/,
          message: "Aadhar number must be 12 digits",
        },
      },
      {
        name: "consentCheckbox",
        label:
          "I hereby give my consent and agree to the terms and conditions for Aadhar based authentication/verification. I understand that my biometric/demographic information will be used for verification purposes only and will be handled as per the privacy policy.",
        type: "checkbox",
        required: true,
      },
    ],
  },
  {
    id: 'application-summary',
    title: "Application Summary",
    stepNumber: 6,
    fields: [],
  },
  {
    id: "payment",
    title: "Payment",
    stepNumber: 7,
    fields: [],
  },
  {
    id: "submit",
    title: "Submit",
    stepNumber: 8,
    fields: [
      {
        name: "finalConsent",
        label:
          "I confirm that all the information provided is accurate and complete.",
        type: "checkbox",
        required: true,
      },
    ],
  },
];

export const getStepById = (id: string): AccordionStep | undefined => {
  return formStepsData.find((step) => step.id === id);
};

export const getStepByNumber = (
  stepNumber: number,
): AccordionStep | undefined => {
  return formStepsData.find((step) => step.stepNumber === stepNumber);
};
