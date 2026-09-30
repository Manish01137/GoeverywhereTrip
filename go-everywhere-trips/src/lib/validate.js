export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
export const isPhone = (s) => /^(\+?91[\s-]?)?[6-9]\d{9}$/.test(s.replace(/[\s-]/g, ''))
