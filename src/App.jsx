import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'

// ─── Utilitários de data ────────────────────────────────────────────────────
const toDateStr = (date) => date.toISOString().split('T')[0]
const today = () => toDateStr(new Date())
const addDays = (str, n) => {
  const d = new Date(str + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}
const formatDisplay = (str) => {
  const d = new Date(str + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}
const isToday = (str) => str === today()
const isPast = (str) => str < today()

// ─── Ícones SVG inline ──────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = 'currentColor' }) => {
  const icons = {
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    chevLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />,
    chevRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />,
    clock: <><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></>,
    tag: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />,
    refresh: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    x: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    history: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} xmlns="http://www.w3.org/2000/svg">
      {icons[name]}
    </svg>
  )
}

// ─── Componente: Badge de categoria ────────────────────────────────────────
const CategoryBadge = ({ category }) => {
  if (!category) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 999,
      fontSize: 11, fontWeight: 500,
      backgroundColor: category.color + '22',
      color: category.color,
      border: `1px solid ${category.color}44`,
    }}>
      {category.name}
    </span>
  )
}

// ─── Componente: Barra de capacidade ────────────────────────────────────────
const CapacityBar = ({ tasks }) => {
  const WORK_MINUTES = 8 * 60 // 8 horas
  const total = tasks.reduce((acc, t) => acc + (t.estimated_minutes || 60), 0)
  const done = tasks.filter(t => t.completed).reduce((acc, t) => acc + (t.estimated_minutes || 60), 0)
  const pct = Math.min(100, Math.round((total / WORK_MINUTES) * 100))
  const donePct = Math.min(100, Math.round((done / WORK_MINUTES) * 100))
  const color = pct > 100 ? '#ef4444' : pct > 80 ? '#f59e0b' : '#22c55e'
  const totalH = Math.floor(total / 60)
  const totalM = total % 60
  const doneH = Math.floor(done / 60)
  const doneM = done % 60

  return (
    <div style={{ padding: '16px 20px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>CAPACIDADE DO DIA</span>
        <span style={{ fontSize: 13, color: color, fontWeight: 600 }}>
          {totalH}h{totalM > 0 ? `${totalM}m` : ''} planejadas / 8h disponíveis
        </span>
      </div>
      <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${donePct}%`, background: '#22c55e', borderRadius: 999, transition: 'width 0.4s ease' }} />
        <div style={{ position: 'absolute', left: `${donePct}%`, top: 0, height: '100%', width: `${Math.max(0, pct - donePct)}%`, background: color + '88', borderRadius: 999, transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: '#22c55e' }}>✓ {doneH}h{doneM > 0 ? `${doneM}m` : ''} concluídas</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pct}% da capacidade</span>
      </div>
    </div>
  )
}

// ─── Componente: Modal de adição/edição de tarefa ──────────────────────────
const TaskModal = ({ task, categories, onSave, onClose }) => {
  const [title, setTitle] = useState(task?.title || '')
  const [categoryId, setCategoryId] = useState(task?.category_id || '')
  const [minutes, setMinutes] = useState(task?.estimated_minutes || 60)
  const [notes, setNotes] = useState(task?.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    await onSave({ title: title.trim(), category_id: categoryId || null, estimated_minutes: Number(minutes), notes: notes.trim() || null })
    setSaving(false)
  }

  const presets = [30, 60, 90, 120]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, width: '100%', maxWidth: 460 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>{task ? 'Editar tarefa' : 'Nova tarefa'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 4 }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>TAREFA</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="Descreva a tarefa..."
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>CATEGORIA</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: categoryId ? 'var(--text)' : 'var(--text-muted)', fontSize: 14, outline: 'none' }}
            >
              <option value="">Sem categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>ESTIMATIVA DE TEMPO</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setMinutes(p)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500,
                    background: minutes === p ? 'var(--accent)' : 'var(--surface2)',
                    border: `1px solid ${minutes === p ? 'var(--accent)' : 'var(--border)'}`,
                    color: minutes === p ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {p < 60 ? `${p}min` : `${p / 60}h`}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                value={minutes}
                onChange={e => setMinutes(Math.max(5, Number(e.target.value)))}
                min={5}
                step={5}
                style={{ width: 90, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>minutos</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>NOTAS (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Detalhes, links, contexto..."
              rows={2}
              style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none', resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: 14 }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            style={{ flex: 2, padding: '10px', background: title.trim() ? 'var(--accent)' : 'var(--surface2)', border: 'none', borderRadius: 'var(--radius-sm)', color: title.trim() ? '#fff' : 'var(--text-muted)', fontSize: 14, fontWeight: 600 }}
          >
            {saving ? 'Salvando...' : task ? 'Salvar alterações' : 'Adicionar tarefa'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente: Item de tarefa ─────────────────────────────────────────────
const TaskItem = ({ task, categories, onToggle, onDelete, onEdit }) => {
  const [expanded, setExpanded] = useState(false)
  const category = categories.find(c => c.id === task.category_id)
  const h = Math.floor(task.estimated_minutes / 60)
  const m = task.estimated_minutes % 60
  const timeStr = h > 0 ? `${h}h${m > 0 ? `${m}m` : ''}` : `${m}min`

  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${task.completed ? 'var(--border)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '14px 16px',
      opacity: task.completed ? 0.6 : 1,
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task)}
          style={{
            width: 22, height: 22, flexShrink: 0, marginTop: 1,
            borderRadius: 6,
            border: `2px solid ${task.completed ? 'var(--success)' : 'var(--border)'}`,
            background: task.completed ? 'var(--success)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          {task.completed && <Icon name="check" size={13} color="#fff" />}
        </button>

        {/* Conteúdo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 14, fontWeight: 500,
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? 'var(--text-muted)' : 'var(--text)',
            }}>
              {task.title}
            </span>
            {task.rolled_over && (
              <span style={{ fontSize: 10, color: 'var(--warning)', background: '#f59e0b11', border: '1px solid #f59e0b33', borderRadius: 999, padding: '1px 6px' }}>
                rolled
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
            <CategoryBadge category={category} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--text-muted)' }}>
              <Icon name="clock" size={12} color="var(--text-muted)" />
              {timeStr}
            </span>
            {task.notes && (
              <button
                onClick={() => setExpanded(e => !e)}
                style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', padding: 0 }}
              >
                {expanded ? 'Menos ↑' : 'Notas ↓'}
              </button>
            )}
          </div>
          {expanded && task.notes && (
            <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: 'var(--text-muted)', borderLeft: '3px solid var(--accent)' }}>
              {task.notes}
            </div>
          )}
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => onEdit(task)}
            style={{ padding: 6, background: 'none', border: 'none', color: 'var(--text-muted)', borderRadius: 6, transition: 'color 0.15s' }}
            title="Editar"
          >
            <Icon name="edit" size={15} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{ padding: 6, background: 'none', border: 'none', color: 'var(--text-muted)', borderRadius: 6, transition: 'color 0.15s' }}
            title="Deletar"
          >
            <Icon name="trash" size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── App principal ──────────────────────────────────────────────────────────
export default function App() {
  const [selectedDate, setSelectedDate] = useState(today())
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [rolledCount, setRolledCount] = useState(0)

  // Carregar categorias (uma vez)
  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  // Carregar tarefas do dia selecionado
  const loadTasks = useCallback(async (date) => {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: true })
    setTasks(data || [])
    setLoading(false)
  }, [])

  // Roll-over: copiar tarefas não concluídas de dias anteriores para hoje
  const runRollover = useCallback(async () => {
    const todayStr = today()
    // Buscar tarefas não concluídas anteriores a hoje que não foram rolled over ainda
    const { data: pending } = await supabase
      .from('tasks')
      .select('*')
      .lt('date', todayStr)
      .eq('completed', false)

    if (!pending || pending.length === 0) return

    // Verificar quais já foram copiadas para hoje (pelo título + original_date)
    const { data: todayTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('date', todayStr)

    const alreadyRolled = new Set(
      (todayTasks || []).filter(t => t.rolled_over).map(t => t.original_date + '|' + t.title)
    )

    const toInsert = pending
      .filter(t => !alreadyRolled.has(t.date + '|' + t.title))
      .map(t => ({
        title: t.title,
        category_id: t.category_id,
        estimated_minutes: t.estimated_minutes,
        notes: t.notes,
        completed: false,
        date: todayStr,
        rolled_over: true,
        original_date: t.original_date || t.date,
      }))

    if (toInsert.length > 0) {
      await supabase.from('tasks').insert(toInsert)
      setRolledCount(toInsert.length)
      setTimeout(() => setRolledCount(0), 5000)
    }
  }, [])

  // Na montagem: rollover + carregar hoje
  useEffect(() => {
    runRollover().then(() => loadTasks(today()))
  }, [runRollover, loadTasks])

  // Ao trocar de data
  useEffect(() => {
    loadTasks(selectedDate)
  }, [selectedDate, loadTasks])

  const handleToggle = async (task) => {
    const completed = !task.completed
    await supabase.from('tasks').update({
      completed,
      completed_at: completed ? new Date().toISOString() : null
    }).eq('id', task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed, completed_at: completed ? new Date().toISOString() : null } : t))
  }

  const handleDelete = async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const handleSave = async (data) => {
    if (editingTask) {
      const { data: updated } = await supabase.from('tasks').update(data).eq('id', editingTask.id).select().single()
      if (updated) setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t))
    } else {
      const { data: created } = await supabase.from('tasks').insert({
        ...data,
        date: selectedDate,
        completed: false,
        rolled_over: false,
      }).select().single()
      if (created) setTasks(prev => [...prev, created])
    }
    setShowModal(false)
    setEditingTask(null)
  }

  const filteredTasks = filterCategory === 'all'
    ? tasks
    : tasks.filter(t => t.category_id === filterCategory)

  const pendingTasks = filteredTasks.filter(t => !t.completed)
  const doneTasks = filteredTasks.filter(t => t.completed)
  const isViewingToday = isToday(selectedDate)
  const isViewingPast = isPast(selectedDate)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '16px 24px', position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sun" size={16} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Beza Dashboard</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gerenciador de Tarefas</div>
          </div>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowModal(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', background: 'var(--accent)', border: 'none',
            borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 13, fontWeight: 600
          }}
        >
          <Icon name="plus" size={16} color="#fff" />
          Nova tarefa
        </button>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px' }}>
        {/* Navegação de datas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button
            onClick={() => setSelectedDate(d => addDays(d, -1))}
            style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}
          >
            <Icon name="chevLeft" size={18} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700, textTransform: 'capitalize' }}>
              {formatDisplay(selectedDate)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2 }}>
              {isViewingToday && <span style={{ fontSize: 11, background: '#7c5cfc22', color: 'var(--accent)', padding: '1px 8px', borderRadius: 999, border: '1px solid #7c5cfc44' }}>Hoje</span>}
              {isViewingPast && !isViewingToday && <span style={{ fontSize: 11, background: '#ef444411', color: '#ef4444', padding: '1px 8px', borderRadius: 999, border: '1px solid #ef444433' }}>Passado</span>}
              {!isViewingToday && !isViewingPast && <span style={{ fontSize: 11, background: '#22c55e11', color: '#22c55e', padding: '1px 8px', borderRadius: 999, border: '1px solid #22c55e33' }}>Futuro</span>}
              {!isViewingToday && (
                <button
                  onClick={() => setSelectedDate(today())}
                  style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', padding: 0, textDecoration: 'underline' }}
                >
                  Ir para hoje
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => setSelectedDate(d => addDays(d, 1))}
            style={{ padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}
          >
            <Icon name="chevRight" size={18} />
          </button>
        </div>

        {/* Alerta de rollover */}
        {rolledCount > 0 && (
          <div style={{ background: '#f59e0b11', border: '1px solid #f59e0b33', borderRadius: 'var(--radius)', padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#f59e0b' }}>
            <Icon name="refresh" size={15} color="#f59e0b" />
            {rolledCount} tarefa{rolledCount > 1 ? 's' : ''} de dias anteriores adicionada{rolledCount > 1 ? 's' : ''} automaticamente.
          </div>
        )}

        {/* Capacidade */}
        {tasks.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <CapacityBar tasks={tasks} />
          </div>
        )}

        {/* Filtro de categorias */}
        {categories.length > 0 && tasks.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              onClick={() => setFilterCategory('all')}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, flexShrink: 0,
                background: filterCategory === 'all' ? 'var(--accent)' : 'var(--surface)',
                border: `1px solid ${filterCategory === 'all' ? 'var(--accent)' : 'var(--border)'}`,
                color: filterCategory === 'all' ? '#fff' : 'var(--text-muted)',
              }}
            >
              Todas ({tasks.length})
            </button>
            {categories
              .filter(c => tasks.some(t => t.category_id === c.id))
              .map(c => {
                const count = tasks.filter(t => t.category_id === c.id).length
                return (
                  <button
                    key={c.id}
                    onClick={() => setFilterCategory(filterCategory === c.id ? 'all' : c.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, flexShrink: 0,
                      background: filterCategory === c.id ? c.color : 'var(--surface)',
                      border: `1px solid ${filterCategory === c.id ? c.color : 'var(--border)'}`,
                      color: filterCategory === c.id ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {c.name} ({count})
                  </button>
                )
              })}
          </div>
        )}

        {/* Lista de tarefas */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⟳</div>
            Carregando...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {isViewingToday ? '✨' : isViewingPast ? '📭' : '📋'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
              {isViewingToday ? 'Nenhuma tarefa para hoje' : isViewingPast ? 'Nenhuma tarefa neste dia' : 'Nenhuma tarefa planejada'}
            </div>
            <div style={{ fontSize: 13 }}>
              {isViewingToday ? 'Adicione uma tarefa para começar o dia!' : isViewingPast ? 'Este dia não teve tarefas registradas.' : 'Que tal planejar o dia com antecedência?'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Pendentes */}
            {pendingTasks.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, marginTop: 4 }}>
                  PENDENTES — {pendingTasks.length}
                </div>
                {pendingTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    categories={categories}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={t => { setEditingTask(t); setShowModal(true) }}
                  />
                ))}
              </>
            )}

            {/* Concluídas */}
            {doneTasks.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, marginTop: pendingTasks.length > 0 ? 12 : 4 }}>
                  CONCLUÍDAS — {doneTasks.length}
                </div>
                {doneTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    categories={categories}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    onEdit={t => { setEditingTask(t); setShowModal(true) }}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {/* Botão flutuante no mobile */}
        <div style={{ height: 80 }} />
      </div>

      {/* Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}
