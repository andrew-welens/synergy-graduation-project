export default function AuthLoader({ message = 'Вход в систему...' }: { message?: string }) {
  return (
    <div className="auth-loader">
      <div className="auth-loader__spinner" aria-hidden="true" />
      <p className="auth-loader__text">{message}</p>
    </div>
  )
}
