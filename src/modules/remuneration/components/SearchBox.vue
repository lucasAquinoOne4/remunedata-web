<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Search, X, Loader2 } from 'lucide-vue-next'
import type { Suggestion } from '@/core/types/api'
import FonteBadge from './FonteBadge.vue'
import HighlightedText from './HighlightedText.vue'

const props = defineProps<{
  modelValue: string
  suggestions: Suggestion[]
  loading?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'select', value: Suggestion): void
  (e: 'submit'): void
}>()

const inputEl = ref<HTMLInputElement | null>(null)
const open = ref(false)
const activeIndex = ref(-1)
const listId = 'search-suggestions'

const visible = computed(() => open.value && props.suggestions.length > 0)

watch(
  () => props.suggestions,
  () => {
    activeIndex.value = -1
  },
)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
  open.value = true
}

function choose(s: Suggestion) {
  emit('select', s)
  open.value = false
  activeIndex.value = -1
}

function onKeydown(event: KeyboardEvent) {
  const count = props.suggestions.length
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!count) return
    open.value = true
    activeIndex.value = (activeIndex.value + 1) % count
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!count) return
    open.value = true
    activeIndex.value = activeIndex.value <= 0 ? count - 1 : activeIndex.value - 1
  } else if (event.key === 'Enter') {
    if (visible.value && activeIndex.value >= 0) {
      event.preventDefault()
      choose(props.suggestions[activeIndex.value])
    } else {
      open.value = false
      emit('submit')
    }
  } else if (event.key === 'Escape') {
    if (open.value) {
      open.value = false
      activeIndex.value = -1
    } else {
      inputEl.value?.blur()
    }
  }
}

function clear() {
  emit('update:modelValue', '')
  nextTick(() => inputEl.value?.focus())
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

function onGlobalKey(event: KeyboardEvent) {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !isTyping(event.target)) {
    event.preventDefault()
    inputEl.value?.focus()
  }
}

onMounted(() => document.addEventListener('keydown', onGlobalKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onGlobalKey))

defineExpose({ focus: () => inputEl.value?.focus() })
</script>

<template>
  <div class="relative">
    <div class="relative group">
      <Search
        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors"
      />
      <input
        ref="inputEl"
        :value="modelValue"
        type="text"
        role="combobox"
        autocomplete="off"
        spellcheck="false"
        :aria-expanded="visible"
        :aria-controls="listId"
        :aria-activedescendant="activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined"
        :placeholder="placeholder ?? 'Busque por nome do servidor…'"
        class="w-full pl-12 pr-24 py-4 bg-white border border-slate-200 rounded-2xl text-lg font-medium shadow-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
        @input="onInput"
        @keydown="onKeydown"
        @focus="open = true"
        @blur="open = false"
      />
      <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <Loader2 v-if="loading" class="w-4 h-4 text-slate-400 animate-spin" />
        <button
          v-if="modelValue"
          type="button"
          class="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          aria-label="Limpar busca"
          @mousedown.prevent
          @click="clear"
        >
          <X class="w-4 h-4" />
        </button>
        <kbd
          v-else
          class="hidden sm:inline-block text-xs font-mono text-slate-400 border border-slate-200 rounded-md px-1.5 py-0.5 bg-slate-50"
          >/</kbd
        >
      </div>
    </div>

    <ul
      v-if="visible"
      :id="listId"
      role="listbox"
      class="absolute z-30 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden"
    >
      <li
        v-for="(s, i) in suggestions"
        :id="`${listId}-${i}`"
        :key="`${s.fonte}-${s.nome}-${i}`"
        role="option"
        :aria-selected="i === activeIndex"
        class="flex items-center justify-between gap-3 px-4 py-2.5 cursor-pointer"
        :class="i === activeIndex ? 'bg-slate-100' : 'hover:bg-slate-50'"
        @mousedown.prevent="choose(s)"
        @mousemove="activeIndex = i"
      >
        <div class="min-w-0">
          <p class="text-sm font-bold text-slate-900 truncate">
            <HighlightedText :text="s.nome" :term="modelValue" />
          </p>
          <p v-if="s.cargo || s.orgao" class="text-xs text-slate-500 truncate">
            {{ [s.cargo, s.orgao].filter(Boolean).join(' · ') }}
          </p>
        </div>
        <FonteBadge :fonte="s.fonte" short />
      </li>
    </ul>
  </div>
</template>
