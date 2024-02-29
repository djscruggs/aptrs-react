const passwordValidator = (password: string) => {
  const length: boolean = password.length > 9;
  const caps: boolean = /[A-Z]/.test(password)
  const special: boolean = /[@#$%!^&*]/.test(password)
  const number: boolean = /[0-9]/.test(password)
  const valid: boolean = length && caps && special && number
  return {valid, length, caps, special, number}
}

export const validPassword = (password: string | undefined) => {
  if(!password) return false
  const {valid} = passwordValidator(password)
  return valid
}

type PasswordDescriptionProps = {
  password: string | undefined
}

export const PasswordDescription = ({password = ''}: PasswordDescriptionProps) => {
  const {valid, length, caps, special, number} = passwordValidator(password)
  return (
      <div className={password && !valid ? 'text-red-500 text-xs' : 'text-xs'}>
        <ul className={`list-disc  pl-4 mb-4 ${valid ? 'text-green-400' : ''}`}>
          <li className={password && length ? 'text-green-400' : ''}>at least 10 characters</li>
          <li className={password && caps ? 'text-green-400' : ''}>at least 1 uppercase letter</li>
          <li className={password && number ? 'text-green-400' : ''}>at least 1 numeral</li>
          <li className={password && special ? 'text-green-400' : ''}>at least 1 special character (@#$%!^&*)</li>
        </ul>
      </div>
    )
}


export default PasswordDescription;