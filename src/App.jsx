import { useState, useEffect, useCallback, useRef } from 'react'
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
    logout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    mail: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    lock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />,
    eye: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>,
    eyeOff: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} xmlns="http://www.w3.org/2000/svg">
      {icons[name]}
    </svg>
  )
}

// ─── Tela de Login ──────────────────────────────────────────────────────────
const LoginScreen = () => {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'error'|'success', text }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname,
      })
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'E-mail enviado! Verifique sua caixa de entrada.' })
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage({ type: 'error', text: error.message })
      else setMessage({ type: 'success', text: 'Conta criada! Verifique seu e-mail para confirmar.' })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage({ type: 'error', text: 'E-mail ou senha incorretos.' })
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname },
    })
    if (error) {
      setMessage({ type: 'error', text: 'Erro ao entrar com Google.' })
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/dashboard-beza/favicon.png"
            alt="Dashboard"
            style={{ width: 80, height: 80, margin: '0 auto 16px', display: 'block', objectFit: 'contain' }}
          />
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Dashboard</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {mode === 'login' ? 'Acesse sua conta' : mode === 'signup' ? 'Crie sua conta' : 'Recuperar senha'}
          </div>
        </div>

        {/* Card */}
        <div className="glass" style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: 28,
        }}>

          {/* Mensagem */}
          {message && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: 13,
              background: message.type === 'error' ? '#ef444415' : '#4caf5015',
              border: `1px solid ${message.type === 'error' ? '#ef444440' : '#4caf5040'}`,
              color: message.type === 'error' ? '#ef4444' : '#4caf50',
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* E-mail */}
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>E-MAIL</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Icon name="mail" size={15} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="seu@email.com"
                  style={{
                    width: '100%', paddingLeft: 36, padding: '10px 12px 10px 36px',
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-input)', color: 'var(--text)', fontSize: 14, outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Senha */}
            {mode !== 'forgot' && (
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>SENHA</label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <Icon name="lock" size={15} />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                    minLength={6}
                    style={{
                      width: '100%', padding: '10px 40px 10px 36px',
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-input)', color: 'var(--text)', fontSize: 14, outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', padding: 2 }}
                  >
                    <Icon name={showPass ? 'eyeOff' : 'eye'} size={15} />
                  </button>
                </div>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setMessage(null) }}
                    style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', marginTop: 6, padding: 0 }}
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
            )}

            {/* Botão principal */}
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '11px', background: 'var(--accent)', border: 'none',
                borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 14, fontWeight: 600,
                opacity: loading ? 0.7 : 1, marginTop: 4,
              }}
            >
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar e-mail'}
            </button>
          </form>

          {/* Divisor */}
          {mode !== 'forgot' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>ou</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={loading}
                style={{
                  width: '100%', padding: '11px', background: 'var(--surface2)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--text)', fontSize: 14, fontWeight: 500,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Entrar com Google
              </button>
            </>
          )}

          {/* Alternar modo */}
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <>Não tem conta?{' '}
                <button onClick={() => { setMode('signup'); setMessage(null) }} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 600, padding: 0 }}>
                  Criar conta
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setMode('login'); setMessage(null) }} style={{ color: 'var(--accent)', background: 'none', border: 'none', fontWeight: 600, padding: 0 }}>
                  ← Voltar ao login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
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
const CapacityBar = ({ tasks, workMinutes = 8 * 60 }) => {
  const total = tasks.reduce((acc, t) => acc + (t.estimated_minutes || 60), 0)
  const done = tasks.filter(t => t.completed).reduce((acc, t) => acc + (t.estimated_minutes || 60), 0)
  const pct = Math.min(100, Math.round((total / workMinutes) * 100))
  const donePct = Math.min(100, Math.round((done / workMinutes) * 100))
  const remaining = Math.max(0, workMinutes - total)
  const totalH = Math.floor(total / 60)
  const totalM = total % 60
  const doneH = Math.floor(done / 60)
  const doneM = done % 60
  const remH = Math.floor(remaining / 60)
  const remM = remaining % 60
  const overloaded = total > workMinutes

  return (
    <div className="glass" style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', border: `1px solid ${overloaded ? '#ef444440' : 'var(--border)'}`, overflow: 'hidden', transition: 'border-color 0.3s' }}>
      {overloaded && (
        <div style={{ background: '#ef444412', borderBottom: '1px solid #ef444430', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15 }}>⚠️</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Capacidade excedida!</span>
            <span style={{ fontSize: 12, color: '#ef4444', opacity: 0.8, marginLeft: 6 }}>Remaneje suas tarefas para outro dia.</span>
          </div>
        </div>
      )}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>CAPACIDADE DO DIA</span>
          <span style={{ fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#e8963a' }}>{totalH}h{totalM > 0 ? `${totalM}m` : ''} planejadas</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>·</span>
            <span style={{ color: overloaded ? '#ef4444' : 'var(--text-muted)' }}>
              {overloaded ? `${Math.floor((total - workMinutes) / 60)}h${(total - workMinutes) % 60 > 0 ? `${(total - workMinutes) % 60}m` : ''} além da capacidade` : `${remH}h${remM > 0 ? `${remM}m` : ''} disponíveis`}
            </span>
          </span>
        </div>
        <div style={{ height: 8, background: 'rgba(150,150,150,0.18)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${donePct}%`, background: '#4caf50', borderRadius: 999, transition: 'width 0.4s ease' }} />
          <div style={{ position: 'absolute', left: `${donePct}%`, top: 0, height: '100%', width: `${Math.max(0, pct - donePct)}%`, background: overloaded ? '#ef4444' : '#fdba74', borderRadius: 999, transition: 'all 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: '#4caf50' }}>✓ {doneH}h{doneM > 0 ? `${doneM}m` : ''} concluídas</span>
          <span style={{ fontSize: 11, color: overloaded ? '#ef4444' : 'var(--text-muted)' }}>{pct}% da capacidade</span>
        </div>
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

  const inputStyle = { width: '100%', background: 'var(--modal-input-bg)', border: '1px solid var(--modal-input-border)', borderRadius: 'var(--radius-input)', padding: '10px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' }
  const labelStyle = { fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: 'block', fontWeight: 700 }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--modal-overlay)', backdropFilter: 'blur(8px) saturate(140%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'var(--modal-bg)', border: '1px solid var(--modal-input-border)', borderRadius: 'var(--modal-radius)', padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'modalIn 0.18s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>{task ? 'Editar tarefa' : 'Nova tarefa'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 4, cursor: 'pointer' }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={labelStyle}>Tarefa</label>
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="Descreva a tarefa..." style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Categoria</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ ...inputStyle, color: categoryId ? 'var(--text)' : 'var(--text-muted)' }}>
              <option value="">Sem categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Estimativa de tempo</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {presets.map(p => (
                <button key={p} onClick={() => setMinutes(p)} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 12, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: minutes === p ? 'var(--accent)' : 'var(--modal-input-bg)',
                  border: `1px solid ${minutes === p ? 'var(--accent)' : 'var(--modal-input-border)'}`,
                  color: minutes === p ? '#fff' : 'var(--text-muted)',
                  boxShadow: minutes === p ? 'var(--btn-glass-shadow)' : 'none',
                }}>
                  {p < 60 ? `${p}min` : `${p / 60}h`}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="number" value={minutes} onChange={e => setMinutes(Math.max(5, Number(e.target.value)))} min={5} step={5}
                style={{ width: 90, background: 'var(--modal-input-bg)', border: '1px solid var(--modal-input-border)', borderRadius: 12, padding: '8px 12px', color: 'var(--text)', fontSize: 14, outline: 'none' }} />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>minutos</span>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notas (opcional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Detalhes, links, contexto..." rows={2}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', background: 'var(--modal-input-bg)', border: '1px solid var(--modal-input-border)', borderRadius: 12, color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!title.trim() || saving} style={{
            flex: 2, padding: '11px',
            background: title.trim() ? 'var(--accent)' : 'var(--modal-input-bg)',
            border: title.trim() ? '1px solid rgba(255,255,255,0.18)' : '1px solid var(--modal-input-border)',
            borderRadius: 12,
            color: title.trim() ? '#fff' : 'var(--text-muted)',
            fontSize: 14, fontWeight: 700, cursor: title.trim() ? 'pointer' : 'default',
            boxShadow: title.trim() ? 'var(--btn-glass-shadow)' : 'none',
          }}>
            {saving ? 'Salvando...' : task ? 'Salvar alterações' : 'Adicionar tarefa'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Componente: Item de tarefa ─────────────────────────────────────────────
const TaskItem = ({ task, categories, onToggle, onDelete, onEdit, overloaded, onOpenReallocate }) => {
  const [expanded, setExpanded] = useState(false)
  const category = categories.find(c => c.id === task.category_id)
  const h = Math.floor(task.estimated_minutes / 60)
  const m = task.estimated_minutes % 60
  const timeStr = h > 0 ? `${h}h${m > 0 ? `${m}m` : ''}` : `${m}min`
  const isOverloaded = overloaded && !task.completed

  return (
    <div className="glass" style={{
      background: isOverloaded ? 'rgba(239,68,68,0.06)' : 'var(--surface)',
      border: `1px solid ${isOverloaded ? '#ef444444' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '14px 16px',
      opacity: task.completed ? 0.6 : 1,
      transition: 'all 0.25s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <button
          onClick={() => onToggle(task)}
          style={{
            width: 22, height: 22, flexShrink: 0, marginTop: 1,
            borderRadius: 6,
            border: `2px solid ${task.completed ? 'var(--success)' : isOverloaded ? '#ef4444' : 'var(--border)'}`,
            background: task.completed ? 'var(--success)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          {task.completed && <Icon name="check" size={13} color="#fff" />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 14, fontWeight: 500,
              textDecoration: task.completed ? 'line-through' : 'none',
              color: task.completed ? 'var(--text-muted)' : isOverloaded ? '#ef4444' : 'var(--text)',
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
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: isOverloaded ? '#ef444499' : 'var(--text-muted)' }}>
              <Icon name="clock" size={12} color={isOverloaded ? '#ef444499' : 'var(--text-muted)'} />
              {timeStr}
            </span>
            {task.notes && (
              <button
                onClick={() => setExpanded(e => !e)}
                style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
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

        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
          {isOverloaded && (
            <button
              onClick={() => onOpenReallocate(task)}
              style={{
                padding: '5px 10px', borderRadius: 50,
                background: '#ef444415',
                border: '1px solid #ef444440',
                color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              title="Realocar para outro dia"
            >
              Realocar →
            </button>
          )}
          <button
            onClick={() => onEdit(task)}
            style={{ padding: 6, background: 'none', border: 'none', color: 'var(--text-muted)', borderRadius: 6, cursor: 'pointer' }}
            title="Editar"
          >
            <Icon name="edit" size={15} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            style={{ padding: 6, background: 'none', border: 'none', color: 'var(--text-muted)', borderRadius: 6, cursor: 'pointer' }}
            title="Deletar"
          >
            <Icon name="trash" size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Onboarding (primeiro acesso) ───────────────────────────────────────────
const OnboardingScreen = ({ session, onComplete }) => {
  const [step, setStep] = useState(1)
  const [name, setName] = useState(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '')
  const [workHours, setWorkHours] = useState(8)
  const [avatarUrl, setAvatarUrl] = useState(session.user.user_metadata?.avatar_url || null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleFinish = async () => {
    setSaving(true)
    let finalAvatarUrl = avatarUrl
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${session.user.id}/avatar.${ext}`
      await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      finalAvatarUrl = publicUrl + '?t=' + Date.now()
    }
    await supabase.auth.updateUser({
      data: {
        full_name: name.trim() || session.user.email?.split('@')[0],
        avatar_url: finalAvatarUrl,
        work_hours: workHours,
        onboarding_complete: true,
      }
    })
    onComplete()
    setSaving(false)
  }

  const displayAvatar = avatarPreview || avatarUrl
  const initials = (name || 'U').charAt(0).toUpperCase()

  const steps = [
    { num: 1, label: 'Seu nome' },
    { num: 2, label: 'Foto de perfil' },
    { num: 3, label: 'Jornada de trabalho' },
  ]

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>

        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/dashboard-beza/favicon.png" alt="Dashboard" style={{ width: 72, height: 72, margin: '0 auto 16px', display: 'block', objectFit: 'contain' }} />
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Bem-vindo ao Dashboard!</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Configure seu perfil antes de começar</div>
        </div>

        {/* Indicador de passos */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= s.num ? 'var(--accent)' : 'var(--surface2)',
                color: step >= s.num ? '#fff' : 'var(--text-muted)',
                border: `2px solid ${step >= s.num ? 'var(--accent)' : 'var(--border)'}`,
                transition: 'all 0.3s',
              }}>{s.num}</div>
              {i < steps.length - 1 && (
                <div style={{ width: 48, height: 2, background: step > s.num ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s', margin: '0 4px' }} />
              )}
            </div>
          ))}
        </div>

        {/* Card do passo */}
        <div className="glass" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28 }}>

          {/* PASSO 1 — Nome */}
          {step === 1 && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Como você se chama?</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Esse nome vai aparecer no seu dashboard.</div>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
                placeholder="Seu nome completo"
                style={{
                  width: '100%', padding: '12px 14px', fontSize: 15,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text)', outline: 'none',
                }}
              />
            </div>
          )}

          {/* PASSO 2 — Foto */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Adicione uma foto de perfil</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Opcional — você pode adicionar depois também.</div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', cursor: 'pointer',
                    background: displayAvatar ? 'transparent' : 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '3px dashed var(--border)', transition: 'border-color 0.2s',
                    position: 'relative',
                  }}
                >
                  {displayAvatar
                    ? <img src={displayAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 36, color: '#fff', fontWeight: 700 }}>{initials}</span>
                  }
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    padding: '8px 20px', background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text)', fontSize: 13, cursor: 'pointer',
                  }}
                >
                  {displayAvatar ? 'Trocar foto' : 'Escolher foto'}
                </button>
              </div>
            </div>
          )}

          {/* PASSO 3 — Horas de trabalho */}
          {step === 3 && (
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Qual é a sua jornada diária?</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>Usamos isso para calcular sua capacidade de trabalho no dia.</div>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{workHours}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>horas por dia</div>
              </div>
              <input
                type="range"
                min={1} max={16} step={1}
                value={workHours}
                onChange={e => setWorkHours(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: 4 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>1h</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>16h</span>
              </div>
            </div>
          )}

          {/* Botões de navegação */}
          <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  flex: 1, padding: '11px', background: 'var(--surface2)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
                }}
              >
                ← Voltar
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !name.trim()}
                style={{
                  flex: 2, padding: '11px',
                  background: (step === 1 && !name.trim()) ? 'var(--surface2)' : 'var(--accent)',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  color: (step === 1 && !name.trim()) ? 'var(--text-muted)' : '#fff',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Próximo →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                style={{
                  flex: 2, padding: '11px', background: 'var(--accent)',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Salvando...' : '🚀 Começar!'}
              </button>
            )}
          </div>
        </div>

        {/* Pular (passo 2) */}
        {step === 2 && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button onClick={() => setStep(3)} style={{ fontSize: 13, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Pular por agora
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Dashboard (app principal autenticado) ──────────────────────────────────
// ─── Realocar Modal ───────────────────────────────────────────────────────────
const ReallocateModal = ({ task, onMove, onClose }) => {
  const [customDate, setCustomDate] = useState('')
  const dateInputRef = useRef(null)
  const quickOptions = [
    { label: 'Amanhã', date: addDays(today(), 1) },
    { label: 'Em 2 dias', date: addDays(today(), 2) },
    { label: 'Semana que vem', date: addDays(today(), 7) },
  ]

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 8500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--modal-overlay)', backdropFilter: 'blur(8px) saturate(140%)',
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--modal-bg)', border: '1px solid var(--modal-input-border)',
        borderRadius: 'var(--modal-radius)', padding: 28,
        width: '100%', maxWidth: 380,
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        animation: 'modalIn 0.18s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>Realocar tarefa</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>{task.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4, marginLeft: 12, flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Quick options */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10 }}>Mover para</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {quickOptions.map(opt => (
              <button key={opt.label} onClick={() => { onMove(task.id, opt.date); onClose() }}
                style={{
                  padding: '8px 16px', borderRadius: 12,
                  background: 'var(--modal-input-bg)', border: '1px solid var(--modal-input-border)',
                  color: 'var(--text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.border = '1px solid var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--modal-input-bg)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.border = '1px solid var(--modal-input-border)' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--modal-input-border)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ou escolha uma data</span>
          <div style={{ flex: 1, height: 1, background: 'var(--modal-input-border)' }} />
        </div>

        {/* Custom date */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, position: 'relative' }} onClick={() => { try { dateInputRef.current?.showPicker() } catch(e) { dateInputRef.current?.focus() } }}>
            <input
              ref={dateInputRef}
              type="date"
              value={customDate}
              min={addDays(today(), 1)}
              onChange={e => setCustomDate(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--modal-input-bg)', border: '1px solid var(--modal-input-border)', borderRadius: 'var(--radius-input)', color: 'var(--text)', fontSize: 14, outline: 'none', cursor: 'pointer' }}
            />
          </div>
          <button onClick={() => { if (customDate) { onMove(task.id, customDate); onClose() } }} disabled={!customDate}
            style={{
              padding: '10px 20px', borderRadius: 12,
              background: customDate ? 'var(--accent)' : 'var(--modal-input-bg)',
              border: customDate ? '1px solid rgba(255,255,255,0.18)' : '1px solid var(--modal-input-border)',
              color: customDate ? '#fff' : 'var(--text-muted)',
              fontSize: 14, fontWeight: 700, cursor: customDate ? 'pointer' : 'default',
              boxShadow: customDate ? 'var(--btn-glass-shadow)' : 'none',
            }}>
            Mover
          </button>
        </div>

        {/* Cancel */}
        <button onClick={onClose} style={{
          width: '100%', padding: '10px',
          background: 'transparent', border: '1px solid var(--modal-input-border)',
          borderRadius: 12, color: 'var(--text-muted)',
          fontSize: 13, cursor: 'pointer',
        }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ─── Undo Toast ──────────────────────────────────────────────────────────────
const UndoToast = ({ toast, onUndo }) => {
  if (!toast) return null
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', alignItems: 'center', gap: 10,
      background: '#1c1c1e', color: '#fff',
      borderRadius: 50, padding: '12px 8px 12px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'slideUpToast 0.22s ease',
      fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      <span>{toast.message}</span>
      <button onClick={onUndo} style={{
        background: 'rgba(255,255,255,0.15)', border: 'none',
        color: '#fff', padding: '6px 16px', borderRadius: 50,
        fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.2,
      }}>
        Desfazer
      </button>
    </div>
  )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ onConfirm, onCancel }) => {
  const [neverAsk, setNeverAsk] = useState(false)
  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 8000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--modal-overlay)', backdropFilter: 'blur(8px) saturate(140%)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--modal-bg)', border: '1px solid var(--modal-input-border)',
        borderRadius: 'var(--modal-radius)', padding: '32px 28px 24px',
        maxWidth: 360, width: '90%', textAlign: 'center',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'modalIn 0.18s ease',
      }}>
        <div style={{ fontSize: 36, marginBottom: 14 }}>🗑️</div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Excluir esta tarefa?</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>
          Você pode desfazer nos próximos segundos após a exclusão.
        </div>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)', marginBottom: 22, cursor: 'pointer' }}>
          <input type="checkbox" checked={neverAsk} onChange={e => setNeverAsk(e.target.checked)} style={{ accentColor: 'var(--accent)', width: 14, height: 14 }} />
          Não perguntar novamente
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px', background: 'var(--modal-input-bg)',
            border: '1px solid var(--modal-input-border)', borderRadius: 12,
            color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button onClick={() => onConfirm(neverAsk)} style={{
            flex: 1, padding: '11px', background: '#ef4444',
            border: '1px solid rgba(255,255,255,0.18)', borderRadius: 12,
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.2) inset, 0 4px 14px rgba(239,68,68,0.3)',
          }}>
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ session }) {
  const userId = session.user.id
  const userEmail = session.user.email

  const [workMinutes] = useState((session.user.user_metadata?.work_hours || 8) * 60)

  // ─── Undo system ───────────────────────────────────────────────────────────
  const [undoToast, setUndoToast] = useState(null)
  const undoTimerRef = useRef(null)
  const undoActionRef = useRef(null)
  const pendingDeletesRef = useRef({})

  const showUndoToast = (message, onUndo) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current)
    undoActionRef.current = onUndo
    setUndoToast({ message })
    undoTimerRef.current = setTimeout(() => {
      setUndoToast(null)
      undoActionRef.current = null
    }, 3000)
  }

  const executeUndo = useCallback(() => {
    if (undoActionRef.current) {
      undoActionRef.current()
      clearTimeout(undoTimerRef.current)
      setUndoToast(null)
      undoActionRef.current = null
    }
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        executeUndo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [executeUndo])

  // ─── Delete confirm ────────────────────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [reallocateTask, setReallocateTask] = useState(null)

  const [displayName, setDisplayName] = useState(
    session.user.user_metadata?.full_name || userEmail?.split('@')[0] || 'Usuário'
  )
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(displayName)
  const nameInputRef = useRef(null)

  const handleNameSave = async () => {
    const trimmed = nameInput.trim()
    if (!trimmed) { setNameInput(displayName); setEditingName(false); return }
    await supabase.auth.updateUser({ data: { full_name: trimmed } })
    setDisplayName(trimmed)
    setEditingName(false)
  }

  const [avatarUrl, setAvatarUrl] = useState(session.user.user_metadata?.avatar_url || null)
  const [avatarHover, setAvatarHover] = useState(false)
  const avatarInputRef = useRef(null)

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { console.error(error); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.auth.updateUser({ data: { avatar_url: publicUrl } })
    setAvatarUrl(publicUrl + '?t=' + Date.now())
  }

  const [selectedDate, setSelectedDate] = useState(today())
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')
  const [rolledCount, setRolledCount] = useState(0)

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  const loadTasks = useCallback(async (date) => {
    setLoading(true)
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('date', date)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    setTasks(data || [])
    setLoading(false)
  }, [userId])

  const runRollover = useCallback(async () => {
    const todayStr = today()
    const { data: pending } = await supabase
      .from('tasks')
      .select('*')
      .lt('date', todayStr)
      .eq('completed', false)
      .eq('user_id', userId)

    if (!pending || pending.length === 0) return

    const { data: todayTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('date', todayStr)
      .eq('user_id', userId)

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
        user_id: userId,
      }))

    if (toInsert.length > 0) {
      await supabase.from('tasks').insert(toInsert)
      setRolledCount(toInsert.length)
      setTimeout(() => setRolledCount(0), 5000)
    }
  }, [userId])

  useEffect(() => {
    runRollover().then(() => loadTasks(today()))
  }, [runRollover, loadTasks])

  useEffect(() => {
    loadTasks(selectedDate)
  }, [selectedDate, loadTasks])

  const handleToggle = async (task) => {
    const completed = !task.completed
    const completedAt = completed ? new Date().toISOString() : null
    await supabase.from('tasks').update({ completed, completed_at: completedAt }).eq('id', task.id)
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed, completed_at: completedAt } : t))

    if (completed) {
      showUndoToast('Tarefa concluída', async () => {
        await supabase.from('tasks').update({ completed: false, completed_at: null }).eq('id', task.id)
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: false, completed_at: null } : t))
      })
    }
  }

  const executeDelete = (id) => {
    const taskToDelete = tasks.find(t => t.id === id)
    setTasks(prev => prev.filter(t => t.id !== id))

    // Deferred real deletion — can be cancelled by undo
    const timeoutId = setTimeout(async () => {
      await supabase.from('tasks').delete().eq('id', id)
      delete pendingDeletesRef.current[id]
    }, 3000)
    pendingDeletesRef.current[id] = timeoutId

    showUndoToast('Tarefa excluída', () => {
      clearTimeout(pendingDeletesRef.current[id])
      delete pendingDeletesRef.current[id]
      if (taskToDelete) setTasks(prev => [...prev, taskToDelete].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
    })
  }

  const handleDelete = (id) => {
    const skipConfirm = localStorage.getItem('skipDeleteConfirm') === '1'
    if (skipConfirm) {
      executeDelete(id)
    } else {
      setDeleteConfirmId(id)
    }
  }

  const handleReallocate = async (id, newDate) => {
    await supabase.from('tasks').update({ date: newDate }).eq('id', id)
    // Remove do dia atual (vai aparecer no dia de destino)
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
        user_id: userId,
      }).select().single()
      if (created) setTasks(prev => [...prev, created])
    }
    setShowModal(false)
    setEditingTask(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const filteredTasks = filterCategory === 'all'
    ? tasks
    : tasks.filter(t => t.category_id === filterCategory)

  const pendingTasks = filteredTasks.filter(t => !t.completed)
  const doneTasks = filteredTasks.filter(t => t.completed)
  const totalPlanned = tasks.reduce((acc, t) => acc + (t.estimated_minutes || 60), 0)
  const isOverloaded = totalPlanned > workMinutes
  const isViewingToday = isToday(selectedDate)
  const isViewingPast = isPast(selectedDate)

  return (
    <div style={{ minHeight: '100vh', background: 'transparent' }}>
      {/* Header flutuante estilo Liquid Glass */}
      <header style={{
        padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'transparent',
      }}>
        {/* Grupo esquerdo: avatar + título + nome */}
        <div className="glass" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface)',
          border: '1px solid var(--glass-border)',
          borderRadius: 50, padding: '7px 16px 7px 7px',
        }}>
          <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          <div
            onClick={() => avatarInputRef.current?.click()}
            onMouseEnter={() => setAvatarHover(true)}
            onMouseLeave={() => setAvatarHover(false)}
            title="Alterar foto"
            style={{
              width: 34, height: 34, borderRadius: '50%', overflow: 'hidden',
              cursor: 'pointer', flexShrink: 0, position: 'relative',
              background: avatarUrl ? 'transparent' : 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, userSelect: 'none' }}>{userName.charAt(0).toUpperCase()}</span>
            }
            {avatarHover && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>📷</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>Dashboard</div>
            {editingName ? (
              <input
                ref={nameInputRef}
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') { setNameInput(displayName); setEditingName(false) } }}
                autoFocus
                style={{ fontSize: 11, color: 'var(--text)', background: 'transparent', border: 'none', borderBottom: '1px solid var(--accent)', outline: 'none', width: 120, padding: '1px 0' }}
              />
            ) : (
              <div onClick={() => { setNameInput(displayName); setEditingName(true) }} title="Editar nome"
                style={{ fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, lineHeight: 1.3 }}>
                {displayName}
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45 }}>
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Grupo direito: nova tarefa + logout separados */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => { setEditingTask(null); setShowModal(true) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 48, padding: '0 20px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 50, color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Icon name="plus" size={15} color="#fff" />
            Nova tarefa
          </button>
          <button
            onClick={handleLogout}
            title="Sair"
            className="glass"
            style={{
              width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', border: '1px solid var(--glass-border)',
              borderRadius: '50%', color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            <Icon name="logout" size={15} />
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px' }}>
        {/* Navegação de datas */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <button
            onClick={() => setSelectedDate(d => addDays(d, -1))}
            className="glass"
            style={{
              width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', border: '1px solid var(--glass-border)',
              borderRadius: '50%', color: 'var(--text-muted)',
            }}
          >
            <Icon name="chevLeft" size={18} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <div style={{ fontSize: 20, fontWeight: 700, textTransform: 'capitalize' }}>
                {formatDisplay(selectedDate)}
              </div>
              {isViewingToday && <span style={{ fontSize: 11, background: '#3b82f622', color: 'var(--accent)', padding: '2px 10px', borderRadius: 999, border: '1px solid #3b82f644', whiteSpace: 'nowrap' }}>Hoje</span>}
              {isViewingPast && !isViewingToday && <span style={{ fontSize: 11, background: '#ef444411', color: '#ef4444', padding: '2px 10px', borderRadius: 999, border: '1px solid #ef444433', whiteSpace: 'nowrap' }}>Passado</span>}
              {!isViewingToday && !isViewingPast && <span style={{ fontSize: 11, background: '#4caf5011', color: '#4caf50', padding: '2px 10px', borderRadius: 999, border: '1px solid #4caf5033', whiteSpace: 'nowrap' }}>Futuro</span>}
            </div>
            {!isViewingToday && (
              <button
                onClick={() => setSelectedDate(today())}
                style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', marginTop: 4 }}
              >
                Ir para hoje
              </button>
            )}
          </div>

          <button
            onClick={() => setSelectedDate(d => addDays(d, 1))}
            className="glass"
            style={{
              width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface)', border: '1px solid var(--glass-border)',
              borderRadius: '50%', color: 'var(--text-muted)',
            }}
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
            <CapacityBar tasks={tasks} workMinutes={workMinutes} />
          </div>
        )}

        {/* Filtro de categorias */}
        {categories.length > 0 && tasks.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              onClick={() => setFilterCategory('all')}
              className={filterCategory === 'all' ? 'glass' : ''}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, flexShrink: 0,
                background: filterCategory === 'all' ? 'rgba(255,255,255,0.18)' : 'var(--surface)',
                border: `1px solid ${filterCategory === 'all' ? 'rgba(255,255,255,0.22)' : 'var(--border)'}`,
                color: filterCategory === 'all' ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: filterCategory === 'all' ? 600 : 500,
              }}
            >
              Todas ({tasks.length})
            </button>
            {categories
              .filter(c => tasks.some(t => t.category_id === c.id))
              .map(c => {
                const isActive = filterCategory === c.id
                const count = tasks.filter(t => t.category_id === c.id).length
                return (
                  <button
                    key={c.id}
                    onClick={() => setFilterCategory(isActive ? 'all' : c.id)}
                    className={isActive ? 'glass' : ''}
                    style={{
                      padding: '6px 14px', borderRadius: 999, fontSize: 12, flexShrink: 0,
                      background: isActive ? 'rgba(255,255,255,0.18)' : 'var(--surface)',
                      border: `1px solid ${isActive ? 'rgba(255,255,255,0.22)' : 'var(--border)'}`,
                      color: isActive ? 'var(--text)' : 'var(--text-muted)',
                      fontWeight: isActive ? 600 : 500,
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
                    overloaded={isOverloaded}
                    onOpenReallocate={task => setReallocateTask(task)}
                  />
                ))}
              </>
            )}
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
                    overloaded={false}
                    onOpenReallocate={task => setReallocateTask(task)}
                  />
                ))}
              </>
            )}
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          categories={categories}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingTask(null) }}
        />
      )}

      {deleteConfirmId && (
        <DeleteConfirmModal
          onConfirm={(neverAsk) => {
            if (neverAsk) localStorage.setItem('skipDeleteConfirm', '1')
            setDeleteConfirmId(null)
            executeDelete(deleteConfirmId)
          }}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {reallocateTask && (
        <ReallocateModal
          task={reallocateTask}
          onMove={handleReallocate}
          onClose={() => setReallocateTask(null)}
        />
      )}

      <UndoToast toast={undoToast} onUndo={executeUndo} />
    </div>
  )
}

// ─── Tela de Teste Gratuito (trial link) ────────────────────────────────────
const TrialSignupScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [showPass, setShowPass] = useState(false)
  const [btnHover, setBtnHover] = useState(false)
  const [googleHover, setGoogleHover] = useState(false)

  const handleTrial = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) return
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name: name.trim(),
          is_trial: true,
          trial_started_at: new Date().toISOString(),
          onboarding_complete: true,
          work_hours: 8,
        }
      }
    })
    if (error) {
      setMessage({ type: 'error', text: error.message.includes('already') ? 'Este e-mail já tem um teste ativo. Faça login abaixo.' : error.message })
    } else {
      setMessage({ type: 'success', text: 'Conta criada! Entrando...' })
    }
    setLoading(false)
  }

  const handleGoogleTrial = async () => {
    setLoading(true)
    localStorage.setItem('trial_signup', '1')
    localStorage.setItem('trial_started_at', new Date().toISOString())
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname + '?trial=1' },
    })
    if (error) {
      setMessage({ type: 'error', text: 'Erro ao entrar com Google.' })
      localStorage.removeItem('trial_signup')
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage({ type: 'error', text: 'E-mail ou senha incorretos.' })
    setLoading(false)
  }

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/dashboard-beza/favicon.png" alt="" style={{ width: 68, height: 68, margin: '0 auto 18px', display: 'block', objectFit: 'contain' }} />
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5 }}>Organize o caos por um dia.</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>Veja o efeito de ter tudo no lugar.<br />Um dia grátis, sem cartão, sem compromisso.</div>
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
          {['24 horas grátis', 'Acesso completo', 'Sem cartão'].map(t => (
            <span key={t} style={{ fontSize: 11, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 50, padding: '4px 12px', color: 'var(--text-muted)' }}>{t}</span>
          ))}
        </div>

        <div className="glass" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28 }}>
          {message && (
            <div style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
              background: message.type === 'error' ? '#ef444415' : '#4caf5015',
              border: `1px solid ${message.type === 'error' ? '#ef444440' : '#4caf5040'}`,
              color: message.type === 'error' ? '#ef4444' : '#4caf50' }}>
              {message.text}
            </div>
          )}

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleTrial}
            disabled={loading}
            onMouseEnter={() => setGoogleHover(true)}
            onMouseLeave={() => setGoogleHover(false)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '11px 16px',
              background: googleHover ? 'var(--surface2)' : 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text)', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', marginBottom: 16,
              transition: 'background 0.15s, transform 0.15s',
              transform: googleHover ? 'scale(1.015)' : 'scale(1)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Começar com Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>ou com e-mail</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <form onSubmit={handleTrial} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>SEU NOME</label>
              <input autoFocus value={name} onChange={e => setName(e.target.value)} required placeholder="Como você se chama?" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>E-MAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, display: 'block' }}>SENHA</label>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Mínimo 6 caracteres"
                  style={{ ...inputStyle, padding: '10px 40px 10px 14px' }} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', padding: 2, cursor: 'pointer' }}>
                  <Icon name={showPass ? 'eyeOff' : 'eye'} size={15} />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !name.trim() || !email.trim() || !password.trim()}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                padding: '12px', background: 'var(--accent)', border: 'none',
                borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 14, fontWeight: 700,
                marginTop: 4, cursor: 'pointer',
                opacity: (loading || !name.trim() || !email.trim() || !password.trim()) ? 0.6 : 1,
                transition: 'transform 0.15s, opacity 0.15s',
                transform: btnHover && name.trim() && email.trim() && password.trim() ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {loading ? 'Criando acesso...' : 'Começar meu teste gratuito'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 14px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>já tem acesso?</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e-mail"
              style={{ flex: 1, padding: '9px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-input)', color: 'var(--text)', fontSize: 13, outline: 'none' }} />
            <button onClick={handleLogin} disabled={loading}
              style={{ padding: '9px 16px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
              Entrar
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          Após as 24h, você precisará adquirir um plano para continuar.
        </div>
      </div>
    </div>
  )
}

// ─── Tela de Trial Expirado ──────────────────────────────────────────────────
const TrialExpiredScreen = () => {
  const handleLogout = () => supabase.auth.signOut()
  const MAIN_URL = 'https://luansinezio.github.io/dashboard-beza/'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <img src="/dashboard-beza/favicon.png" alt="" style={{ width: 80, height: 80, margin: '0 auto 24px', display: 'block', objectFit: 'contain', opacity: 0.6 }} />
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Seu teste gratuito expirou</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6 }}>
          Suas 24 horas de acesso chegaram ao fim.<br />Para continuar usando o Dashboard, crie sua conta no link principal.
        </div>
        <div className="glass" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Acesse o link abaixo para criar sua conta permanente:</div>
          <a href={MAIN_URL}
            style={{ display: 'block', padding: '12px', background: 'var(--accent)', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none', marginBottom: 10 }}>
            Criar minha conta →
          </a>
          <button onClick={handleLogout}
            style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: 13 }}>
            Sair
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers de trial ────────────────────────────────────────────────────────
const IS_TRIAL_LINK = new URLSearchParams(window.location.search).get('trial') === '1'

const isTrialExpired = (session) => {
  const meta = session?.user?.user_metadata
  if (!meta?.is_trial || !meta?.trial_started_at) return false
  return (Date.now() - new Date(meta.trial_started_at).getTime()) > 24 * 60 * 60 * 1000
}

// ─── App raiz com controle de autenticação ──────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined)
  const [onboardingDone, setOnboardingDone] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) setOnboardingDone(!!session.user.user_metadata?.onboarding_complete)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        setOnboardingDone(!!session.user.user_metadata?.onboarding_complete)
        // Google trial: se o usuário entrou via Google pelo link trial, marca como trial
        if (localStorage.getItem('trial_signup') === '1' && !session.user.user_metadata?.is_trial) {
          const trialStartedAt = localStorage.getItem('trial_started_at') || new Date().toISOString()
          localStorage.removeItem('trial_signup')
          localStorage.removeItem('trial_started_at')
          await supabase.auth.updateUser({
            data: { is_trial: true, trial_started_at: trialStartedAt, onboarding_complete: true, work_hours: 8 }
          })
          const { data: { session: refreshed } } = await supabase.auth.getSession()
          setSession(refreshed)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <img src="/dashboard-beza/favicon.png" alt="" style={{ width: 48, height: 48, margin: '0 auto 12px', display: 'block', objectFit: 'contain', opacity: 0.6 }} />
          Carregando...
        </div>
      </div>
    )
  }

  if (!session) {
    return IS_TRIAL_LINK ? <TrialSignupScreen /> : <LoginScreen />
  }

  if (isTrialExpired(session)) return <TrialExpiredScreen />

  if (!onboardingDone) {
    return (
      <OnboardingScreen
        session={session}
        onComplete={async () => {
          const { data: { session: refreshed } } = await supabase.auth.getSession()
          setSession(refreshed)
          setOnboardingDone(true)
        }}
      />
    )
  }
  return <Dashboard session={session} />
}
