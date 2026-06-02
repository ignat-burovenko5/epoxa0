type IconProps = {
  className?: string;
};

/** SVG Repo: email-1 — https://www.svgrepo.com/svg/521128/email-1 */
export function EmailIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.75 5.25L3 6V18L3.75 18.75H20.25L21 18V6L20.25 5.25H3.75ZM4.5 7.6955V17.25H19.5V7.69525L11.9999 14.5136L4.5 7.6955ZM18.3099 6.75H5.68986L11.9999 12.4864L18.3099 6.75Z"
      />
    </svg>
  );
}

/** Map pin — location / showroom */
export function LocationIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 21C12 21 19 13.5 19 9.5C19 6.08 15.87 3 12 3C8.13 3 5 6.08 5 9.5C5 13.5 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Clock — working hours */
export function ClockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v5l3.5 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Delivery truck */
export function DeliveryIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 7h11v8H3V7ZM14 10h4l3 3v2h-7v-5ZM6.5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17.5 17a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 10H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** SVG Repo: arrow-square-up-right — https://www.svgrepo.com/svg/421dadc2/arrow-square-up-right */
export function ArrowSquareUpRightIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M15.0001 13.5V9M15.0001 9H10.5001M15.0001 9L9.00024 14.9999M7.20024 20H16.8002C17.9203 20 18.4804 20 18.9082 19.782C19.2845 19.5903 19.5905 19.2843 19.7823 18.908C20.0002 18.4802 20.0002 17.9201 20.0002 16.8V7.2C20.0002 6.0799 20.0002 5.51984 19.7823 5.09202C19.5905 4.71569 19.2845 4.40973 18.9082 4.21799C18.4804 4 17.9203 4 16.8002 4H7.20024C6.08014 4 5.52009 4 5.09226 4.21799C4.71594 4.40973 4.40998 4.71569 4.21823 5.09202C4.00024 5.51984 4.00024 6.07989 4.00024 7.2V16.8C4.00024 17.9201 4.00024 18.4802 4.21823 18.908C4.40998 19.2843 4.71594 19.5903 5.09226 19.782C5.52009 20 6.08014 20 7.20024 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** SVG Repo: phone-rounded — https://www.svgrepo.com/svg/529758/phone-rounded */
export function PhoneIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.00655 7.93309C3.93421 9.84122 4.41713 13.0817 7.6677 16.3323C8.45191 17.1165 9.23553 17.7396 10 18.2327M5.53781 4.93723C6.93076 3.54428 9.15317 3.73144 10.0376 5.31617L10.6866 6.4791C11.2723 7.52858 11.0372 8.90532 10.1147 9.8278C10.1147 9.8278 10.1147 9.8278 10.1147 9.8278C10.1146 9.82792 8.99588 10.9468 11.0245 12.9755C13.0525 15.0035 14.1714 13.8861 14.1722 13.8853C14.1722 13.8853 14.1722 13.8853 14.1722 13.8853C15.0947 12.9628 16.4714 12.7277 17.5209 13.3134L18.6838 13.9624C20.2686 14.8468 20.4557 17.0692 19.0628 18.4622C18.2258 19.2992 17.2004 19.9505 16.0669 19.9934C15.2529 20.0243 14.1963 19.9541 13 19.6111"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
