import { useCallback } from 'react'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import type { NextPage } from 'next'
import axios from 'axios'

const Home: NextPage = () => {
  
  const simpleAuth = useCallback(async () => {
    const registerResp = await axios.get('/api/registration-options')

    let attRegister

    try {
      registerResp.data.authenticatorSelection.residentKey = 'required';
      registerResp.data.authenticatorSelection.requireResidentKey = true;
      registerResp.data.extensions = { credProps: true }

      attRegister = await startRegistration(registerResp.data)
    } catch (error) {
      const _error = error as Error
      if(_error.name === 'InvalidStateError') alert('Erro: esse autenticador provavelmente já foi registrado pelo usuário')

      throw _error
    }

    const verificationRegisterResp = await axios.post('/api/registration-verify', { ...attRegister, challenge: registerResp.data.challenge }, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if(verificationRegisterResp.data && verificationRegisterResp.data.verified) alert('Autenticador Registrado')

    const authResp = await axios.get('/api/authentication-options')

    let authOptions

    try {
      authOptions = await startAuthentication(authResp.data)
    } catch (error) {
      const _error = error as Error
      console.log(_error)
    }

    const verificationAuthResp = await axios.post('/api/authentication-verify', authOptions, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if(verificationAuthResp && verificationAuthResp.data.verified) {
      alert('Usuário Autenticado')
    } else {
      alert('Ocorreu um erro na autenticação')
    }
  }, [])

  return (
    <div>
      <h1>Funcionando</h1>
      <button onClick={simpleAuth}>teste</button>
    </div>
  )
}

export default Home
