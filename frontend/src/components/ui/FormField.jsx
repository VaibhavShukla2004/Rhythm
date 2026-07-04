/**
 * FormField — reusable label + input pair
 * Props: label, id, type, value, onChange, placeholder, required, min, max
 */
const FormField = ({ label, id, type = 'text', value, onChange, placeholder, required, min, max }) => {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        autoComplete="off"
      />
    </div>
  );
};

export default FormField;
