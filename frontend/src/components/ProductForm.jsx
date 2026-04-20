import { useState, useEffect } from 'react';
import { ValidationUtils } from '../utilities/ValidationUtils';

const EMPTY = {
  name: '',
  sku: '',
  description: '',
  categoryId: '',
  supplierId: '',
  quantity: '',
  unitPrice: '',
  reorderLevel: 10,
};

// ✅ Static dropdown data (no backend change needed)
const CATEGORIES = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Furniture' },
  { id: 3, name: 'Groceries' },
  { id: 4, name: 'Stationery' }
];

const SUPPLIERS = [
  { id: 1, name: 'ABC Traders' },
  { id: 2, name: 'Reliance Suppliers' },
  { id: 3, name: 'Global Distributors' },
  { id: 4, name: 'Local Vendor' }
];

function buildInitialForm(initial) {
  if (!initial) return { ...EMPTY };
  return {
    ...EMPTY,
    ...initial,
    categoryId: initial?.category?.id ?? initial?.categoryId ?? '',
    supplierId: initial?.supplier?.id ?? initial?.supplierId ?? '',
    unitPrice: initial?.unitPrice ?? initial?.price ?? '',
  };
}

// Reusable input field
function Field({ label, field, form, errors, setField, type = 'text', ...rest }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type={type}
        value={form[field] ?? ''}
        onChange={setField(field)}
        {...rest}
      />
      {errors[field] && <div className="error-msg">{errors[field]}</div>}
    </div>
  );
}

export default function ProductForm({
  initial = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState(() => buildInitialForm(initial));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(buildInitialForm(initial));
    setErrors({});
  }, [initial]);

  const setField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = ValidationUtils.validateProduct(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});

    // ✅ Correct payload for backend
    await onSubmit({
      name: form.name,
      sku: form.sku,
      description: form.description,
      quantity: Number(form.quantity),
      price: Number(form.unitPrice),
      reorderLevel: Number(form.reorderLevel),

      category: { id: Number(form.categoryId) },
      supplier: { id: Number(form.supplierId) },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div className="form-grid-2">
        
        <Field
          label="Product Name *"
          field="name"
          form={form}
          errors={errors}
          setField={setField}
          placeholder="e.g. Wireless Mouse"
        />

        <Field
          label="SKU"
          field="sku"
          form={form}
          errors={errors}
          setField={setField}
          placeholder="e.g. WM-001"
        />

        {/* ✅ Category Dropdown */}
        <div className="form-group">
          <label>Category *</label>
          <select value={form.categoryId} onChange={setField('categoryId')}>
            <option value="">Select Category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <div className="error-msg">{errors.categoryId}</div>
          )}
        </div>

        {/* ✅ Supplier Dropdown */}
        <div className="form-group">
          <label>Supplier *</label>
          <select value={form.supplierId} onChange={setField('supplierId')}>
            <option value="">Select Supplier</option>
            {SUPPLIERS.map((sup) => (
              <option key={sup.id} value={sup.id}>
                {sup.name}
              </option>
            ))}
          </select>
          {errors.supplierId && (
            <div className="error-msg">{errors.supplierId}</div>
          )}
        </div>

        <Field
          label="Quantity *"
          field="quantity"
          type="number"
          min="0"
          form={form}
          errors={errors}
          setField={setField}
        />

        <Field
          label="Unit Price (₹) *"
          field="unitPrice"
          type="number"
          min="0"
          step="0.01"
          form={form}
          errors={errors}
          setField={setField}
        />

        <Field
          label="Reorder Level"
          field="reorderLevel"
          type="number"
          min="0"
          form={form}
          errors={errors}
          setField={setField}
        />

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Description</label>
          <input
            type="text"
            value={form.description}
            onChange={setField('description')}
            placeholder="Short description"
          />
          {errors.description && (
            <div className="error-msg">{errors.description}</div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update Product' : 'Add Product'}
        </button>

        {onCancel && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}