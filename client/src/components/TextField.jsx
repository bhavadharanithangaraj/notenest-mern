// Label + input (or textarea) + error message in one reusable piece.
// Pass `multiline` for a textarea; every other prop goes to the input.
import { useId } from 'react';

export default function TextField({ label, error, hint, multiline = false, ...inputProps }) {
  const id = useId();
  const Input = multiline ? 'textarea' : 'input';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Input id={id} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...inputProps} />
      {error ? (
        <small id={`${id}-error`} className="field-error">{error}</small>
      ) : (
        hint && <small id={`${id}-hint`} className="field-hint">{hint}</small>
      )}
    </div>
  );
}
