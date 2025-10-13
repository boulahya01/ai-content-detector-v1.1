export const formStyles = {
  input: `pl-10 w-full rounded-xl p-4 transition-all focus:ring-2 focus:ring-accent-300
    bg-[color:var(--surface-500)] text-[color:var(--text-100)] border border-white/10 
    shadow-lg hover:shadow-xl placeholder:text-white/40 placeholder:font-normal
    [&:not(:placeholder-shown)]:bg-[color:var(--surface-500)]
    [-webkit-autofill:transition-colors_1s_ease-in-out]`,
  inputIcon: "absolute left-3 top-1/2 -translate-y-1/2 text-accent-300",
  label: "block text-sm font-medium text-white mb-1",
  secondaryText: "text-white/70",
  errorText: "mt-1 text-sm text-red-500",
  helpText: "mt-1 text-sm text-white/50",
  button: "w-full btn rounded-full px-8 py-3 text-lg font-bold shadow-md focus:ring-2 focus:ring-accent-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-600 active:bg-accent-700",
  link: "font-medium text-accent-300 hover:text-accent-200 transition-colors"
};