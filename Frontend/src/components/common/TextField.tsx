import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  error?: string;
  showPasswordToggle?: boolean;
};

function TextField({
  label,
  icon,
  error,
  showPasswordToggle = false,
  type,
  ...props
}: TextFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPasswordField = showPasswordToggle && type === "password";
  const inputType = isPasswordField
    ? passwordVisible
      ? "text"
      : "password"
    : type;

  const wrapClassName = [
    "input-wrap",
    !icon ? "no-icon" : "",
    isPasswordField ? "has-toggle" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className="field">
      <span>{label}</span>
      <div className={wrapClassName}>
        {icon}
        <input type={inputType} {...props} />
        {isPasswordField ? (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setPasswordVisible((current) => !current)}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        ) : null}
      </div>
      {error ? <p className="field-error">{error}</p> : null}
    </label>
  );
}

export default TextField;

