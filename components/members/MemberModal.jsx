import {
  X,
  Dumbbell,
  Plus,
  RefreshCw,
  CalendarDays,
  Pencil,
  CalendarCog,
} from "lucide-react";
import {
  today,
  addDays,
  daysLeft,
  formatDate,
  getStatus,
} from "@/utils/memberUtils";
import ImportMembersModal from "./ImportMembersModal";

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#8BC34A] focus:ring-2 focus:ring-[#8BC34A]/15 transition placeholder:text-gray-400 bg-[#FAFBFA] focus:bg-white";

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[100] bg-[#101810]/55 backdrop-blur-sm flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-start justify-between p-6 bg-gradient-to-r from-[#F1F7E9] to-white border-b border-gray-100">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#E5F0D9] text-[#52772D] flex items-center justify-center mb-3">
              <Dumbbell size={18} />
            </div>

            <h2 className="text-lg font-bold text-[#17211A]">{title}</h2>

            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl cursor-pointer hover:bg-white text-gray-500 transition"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2 min-w-0">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function StatusBadge({ expiry }) {
  const status = getStatus(expiry);

  const styles = {
    Active: "bg-[#EEF6E7] text-[#56852E]",
    Expiring: "bg-orange-50 text-orange-700",
    Expired: "bg-red-50 text-red-700",
    "No Plan": "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`px-2.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="text-[11px] uppercase tracking-wider font-bold text-[#719A43] mb-4">
      {children}
    </p>
  );
}

function FormError({ children }) {
  if (!children) return null;

  return (
    <p className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-sm">
      {children}
    </p>
  );
}

function ModalButtons({
  onCancel,
  saving,
  disabled,
  submitText,
  loadingText,
  icon: Icon,
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="flex-1 border cursor-pointer border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
      >
        Cancel
      </button>

      <button
        disabled={saving || disabled}
        className="flex-1 inline-flex cursor-pointer justify-center items-center gap-2 bg-[#17211A] text-white rounded-xl py-3 text-sm font-semibold hover:bg-[#304B32] disabled:opacity-50 transition"
      >
        <Icon size={16} />
        {saving ? loadingText : submitText}
      </button>
    </div>
  );
}

function PlanExpiry({ baseDate, duration }) {
  return (
    <div className="mt-3 p-4 bg-[#F3F8ED] border border-[#E4EED9] rounded-xl flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500">Membership expiry</p>

        <p className="text-sm font-bold text-[#17211A] mt-1">
          {formatDate(addDays(baseDate, duration))}
        </p>
      </div>

      <div className="w-10 h-10 rounded-xl bg-white text-[#719A43] flex items-center justify-center">
        <CalendarDays size={20} />
      </div>
    </div>
  );
}

function AddMemberModal({ onClose, plans, saving, error, form, handlers }) {
  const selectedPlan = plans.find((p) => String(p.id) === String(form.planId));

  return (
    <Modal
      title="Add new member"
      subtitle="Register a member and record their first payment."
      onClose={onClose}
    >
      <form onSubmit={handlers.addMember} className="space-y-5">
        <div>
          <SectionTitle>Member information</SectionTitle>

          <div className="space-y-4">
            <Field label="Full name">
              <input
                value={form.name}
                onChange={(e) => form.setName(e.target.value)}
                placeholder="Enter member name"
                className={inputClass}
                required
              />
            </Field>

            <Field label="Phone number">
              <input
                type="tel"
                inputMode="numeric"
                value={form.phone}
                onChange={(e) =>
                  form.setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10-digit mobile number"
                maxLength={10}
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number"
                className={inputClass}
                required
              />
            </Field>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5">
          <SectionTitle>Membership details</SectionTitle>

          <Field label="Select membership plan">
            <select
              value={form.planId}
              onChange={(e) => handlers.onPlanChange(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Choose a plan</option>

              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} · {plan.duration_days} days · ₹{plan.price}
                </option>
              ))}
            </select>
          </Field>

          {selectedPlan && (
            <PlanExpiry
              baseDate={today()}
              duration={selectedPlan.duration_days}
            />
          )}
        </div>

        <div className="border-t border-gray-100 pt-5">
          <SectionTitle>03 · First payment</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Amount (₹)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => form.setAmount(e.target.value)}
                placeholder="Amount"
                className={inputClass}
                required
              />
            </Field>

            <Field label="Payment method">
              <select
                value={form.mode}
                onChange={(e) => form.setMode(e.target.value)}
                className={inputClass}
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </Field>
          </div>
        </div>

        <FormError>{error}</FormError>

        <ModalButtons
          onCancel={onClose}
          saving={saving}
          disabled={!plans.length}
          submitText="Add member"
          loadingText="Saving..."
          icon={Plus}
        />
      </form>
    </Modal>
  );
}

function RenewMemberModal({
  member,
  onClose,
  plans,
  saving,
  error,
  form,
  handlers,
}) {
  const selectedPlan = plans.find((p) => String(p.id) === String(form.rPlanId));

  const left = daysLeft(member.expiry_date);

  const baseDate = left !== null && left >= 0 ? member.expiry_date : today();

  return (
    <Modal
      title="Renew membership"
      subtitle={`Update the membership for ${member.name}.`}
      onClose={onClose}
    >
      <form onSubmit={handlers.renew} className="space-y-5">
        <div className="bg-[#F7F9F7] border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center font-bold">
              {member.name?.charAt(0)?.toUpperCase() || "M"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 truncate">{member.name}</p>

              <p className="text-xs text-gray-500 mt-1">{member.phone}</p>
            </div>

            <StatusBadge expiry={member.expiry_date} />
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500">Current expiry</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {formatDate(member.expiry_date)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">Current plan</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {member.plans?.name || "No plan"}
              </p>
            </div>
          </div>
        </div>

        <Field label="New membership plan">
          <select
            value={form.rPlanId}
            onChange={(e) => handlers.onRenewPlanChange(e.target.value)}
            className={inputClass}
            required
          >
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} · {plan.duration_days} days · ₹{plan.price}
              </option>
            ))}
          </select>
        </Field>

        {selectedPlan && (
          <PlanExpiry
            baseDate={baseDate}
            duration={selectedPlan.duration_days}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Amount (₹)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.rAmount}
              onChange={(e) => form.setRAmount(e.target.value)}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Payment method">
            <select
              value={form.rMode}
              onChange={(e) => form.setRMode(e.target.value)}
              className={inputClass}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>

        <FormError>{error}</FormError>

        <ModalButtons
          onCancel={onClose}
          saving={saving}
          disabled={!plans.length}
          submitText="Confirm renewal"
          loadingText="Processing..."
          icon={RefreshCw}
        />
      </form>
    </Modal>
  );
}

function EditMemberModal({ member, onClose, saving, error, form, handlers }) {
  return (
    <Modal
      title="Edit member"
      subtitle={`Update personal information for ${member.name}.`}
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      <form onSubmit={handlers.updateMember} className="space-y-5">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#F7F9F7] p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF4E8] font-bold text-[#52772D]">
            {member.name?.charAt(0)?.toUpperCase() || "M"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-gray-900">{member.name}</p>

            <p className="mt-1 text-xs text-gray-500">
              {member.plans?.name || "No plan"}
            </p>
          </div>

          <StatusBadge expiry={member.expiry_date} />
        </div>

        <div>
          <SectionTitle>Member information</SectionTitle>

          <div className="space-y-4">
            <Field label="Full name">
              <input
                value={form.editName}
                onChange={(e) => form.setEditName(e.target.value)}
                placeholder="Enter member name"
                className={inputClass}
                disabled={saving}
                required
              />
            </Field>

            <Field label="Phone number">
              <input
                type="tel"
                inputMode="numeric"
                value={form.editPhone}
                onChange={(e) =>
                  form.setEditPhone(
                    e.target.value.replace(/\D/g, "").slice(0, 10),
                  )
                }
                placeholder="10-digit mobile number"
                maxLength={10}
                pattern="[0-9]{10}"
                className={inputClass}
                disabled={saving}
                required
              />
            </Field>

            <Field label="Joining date">
              <input
                type="date"
                value={form.editJoinDate}
                onChange={(e) => form.setEditJoinDate(e.target.value)}
                max={today()}
                className={inputClass}
                disabled={saving}
                required
              />
            </Field>
          </div>
        </div>

        <div className="rounded-xl border border-[#E4EED9] bg-[#F3F8ED] p-3">
          <p className="text-xs leading-relaxed text-[#52772D]">
            Changes to personal information will not affect membership expiry,
            plans or payment history.
          </p>
        </div>

        <FormError>{error}</FormError>

        <ModalButtons
          onCancel={onClose}
          saving={saving}
          submitText="Save changes"
          loadingText="Saving..."
          icon={Pencil}
        />
      </form>
    </Modal>
  );
}

function AdjustMembershipModal({
  member,
  plans,
  onClose,
  saving,
  error,
  form,
  handlers,
}) {
  return (
    <Modal
      title="Adjust membership"
      subtitle={`Modify membership details for ${member.name}.`}
      onClose={() => {
        if (!saving) onClose();
      }}
    >
      <form onSubmit={handlers.adjustMembership} className="space-y-5">
        {/* Member information */}
        <div className="bg-[#F7F9F7] border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-[#EEF4E8] text-[#52772D] flex items-center justify-center font-bold">
              {member.name?.charAt(0)?.toUpperCase() || "M"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-bold text-gray-900 truncate">{member.name}</p>

              <p className="text-xs text-gray-500 mt-1">{member.phone}</p>
            </div>

            <StatusBadge expiry={member.expiry_date} />
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-500">Current plan</p>

              <p className="text-sm font-semibold text-gray-800 mt-1">
                {member.plans?.name || "No plan"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">Current expiry</p>

              <p className="text-sm font-semibold text-gray-800 mt-1">
                {formatDate(member.expiry_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Membership form */}
        <div>
          <SectionTitle>Membership adjustment</SectionTitle>

          <div className="space-y-4">
            <Field label="Membership plan">
              <select
                value={form.adjustPlanId}
                onChange={(e) => form.setAdjustPlanId(e.target.value)}
                className={inputClass}
                disabled={saving}
                required
              >
                <option value="">Select membership plan</option>

                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} · {plan.duration_days} days
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Membership expiry date">
              <input
                type="date"
                value={form.adjustExpiryDate}
                onChange={(e) => form.setAdjustExpiryDate(e.target.value)}
                min={member.join_date || undefined}
                className={inputClass}
                disabled={saving}
                required
              />
            </Field>
          </div>
        </div>

        {/* Updated membership preview */}
        {form.adjustExpiryDate && (
          <div className="flex items-center justify-between rounded-xl border border-[#E4EED9] bg-[#F3F8ED] p-4">
            <div>
              <p className="text-xs text-gray-500">Updated membership status</p>

              <p className="text-sm font-bold text-[#17211A] mt-1">
                {formatDate(form.adjustExpiryDate)}
              </p>
            </div>

            <StatusBadge expiry={form.adjustExpiryDate} />
          </div>
        )}

        {/* Important information */}
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
          <p className="text-sm font-semibold text-orange-800">
            No payment will be recorded
          </p>

          <p className="mt-1 text-xs leading-relaxed text-orange-700">
            This action only updates membership details. To record a new
            payment, use the Renew membership option instead.
          </p>
        </div>

        <FormError>{error}</FormError>

        <ModalButtons
          onCancel={onClose}
          saving={saving}
          disabled={!plans.length}
          submitText="Save adjustment"
          loadingText="Saving..."
          icon={CalendarCog}
        />
      </form>
    </Modal>
  );
}

export default function MemberModals({
  showAdd,
  setShowAdd,
  showImport,
  setShowImport,
  existingMembers,
  onImportMembers,
  renewMember,
  setRenewMember,
  editingMember,
  setEditingMember,
  plans,
  saving,
  error,
  renewError,
  editError,
  form,
  handlers,
  adjustingMember,
  setAdjustingMember,
  adjustError,
}) {
  return (
    <>
      {showAdd && (
        <AddMemberModal
          onClose={() => {
            setShowAdd(false);
            handlers.resetAddForm();
          }}
          plans={plans}
          saving={saving}
          error={error}
          form={form}
          handlers={handlers}
        />
      )}

      {showImport && (
        <ImportMembersModal
          onClose={() => setShowImport(false)}
          plans={plans}
          existingMembers={existingMembers}
          onImport={onImportMembers}
          saving={saving}
        />
      )}

      {renewMember && (
        <RenewMemberModal
          member={renewMember}
          onClose={() => setRenewMember(null)}
          plans={plans}
          saving={saving}
          error={renewError}
          form={form}
          handlers={handlers}
        />
      )}

      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          saving={saving}
          error={editError}
          form={form}
          handlers={handlers}
        />
      )}

      {adjustingMember && (
        <AdjustMembershipModal
          member={adjustingMember}
          plans={plans}
          onClose={() => setAdjustingMember(null)}
          saving={saving}
          error={adjustError}
          form={form}
          handlers={handlers}
        />
      )}
    </>
  );
}
