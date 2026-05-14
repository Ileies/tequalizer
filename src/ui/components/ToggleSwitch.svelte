<script lang="ts">
  let {
    checked,
    label,
    compact = false,
    onToggle,
  }: {
    checked: boolean;
    label: string;
    compact?: boolean;
    onToggle: () => void;
  } = $props();
</script>

<button
  class="relative cursor-pointer transition-colors duration-200 shrink-0 {compact ? 'w-10 h-[22px] rounded-[11px]' : 'w-11 h-6 rounded-xl'} {checked ? 'bg-[#89b4fa]' : 'bg-[#313244]'}"
  onclick={onToggle}
  aria-pressed={checked}
  aria-label={label}
>
  <span
    class="absolute rounded-full bg-[#cdd6f4] transition-transform duration-200 pointer-events-none w-4 h-4 {compact ? 'top-[3px] left-[3px]' : 'top-1 left-1'} {checked ? (compact ? 'translate-x-[18px]' : 'translate-x-5') : ''}"
  ></span>
</button>
