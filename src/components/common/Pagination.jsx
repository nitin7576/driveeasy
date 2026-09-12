import { rangeIndices } from '../../utils/helpers';

export default function Pagination({ page, pageCount, onChange }) {
  if (pageCount <= 1) return null;
  const pages = rangeIndices(1, pageCount);
  return (
    <nav>
      <ul className="pagination pagination-sm justify-content-center mb-0">
        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page - 1)}>‹</button>
        </li>
        {pages.map((p) => (
          <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onChange(p)}>{p}</button>
          </li>
        ))}
        <li className={`page-item ${page === pageCount ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page + 1)}>›</button>
        </li>
      </ul>
    </nav>
  );
}