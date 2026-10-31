// Search input with a magnifier icon and a clear (×) button. It is
// "controlled": the parent owns `value` and decides when to search.
import { SearchIcon } from './icons';

export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search" role="search">
      <span className="search-icon"><SearchIcon /></span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={100}
      />
      {value && (
        <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Clear search">
          ×
        </button>
      )}
    </div>
  );
}
