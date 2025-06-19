import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from "@/assets/eugasteilogo.svg";
import GoogleIcon from "@/assets/logogoogle.svg";
import AppleIcon from "@/assets/logoapple.svg";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        throw new Error(signInError.message || 'Falha ao fazer login.');
      }
      
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-background min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Quadriculado com escala grande */}
      <div className="absolute inset-0 pointer-events-none z-0 [background-image:repeating-linear-gradient(0deg,_rgba(255,255,255,0.02)_0px,_rgba(255,255,255,0.02)_1px,_transparent_1px,_transparent_256px),repeating-linear-gradient(90deg,_rgba(255,255,255,0.02)_0px,_rgba(255,255,255,0.02)_1px,_transparent_1px,_transparent_256px)]" />
      
      {/* Luz difusa branca */}
      <div className="absolute top-[-700px] left-1/2 transform -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-background opacity-15 blur-[1200px] pointer-events-none z-10" />
      
      {/* Conteúdo principal - Card de login */}
      <div className="relative z-20 w-full max-w-[506px]">
        <div className="bg-background rounded-[16px] border border-border px-6 py-10 md:p-[66px]">
          {/* Luz difusa no topo - reforçada */}
          <div className="absolute top-[-150px] left-1/2 transform -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-background opacity-80 blur-[350px] pointer-events-none z-0" />
          
          {/* Conteúdo */}
          <div className="relative z-10">
            {/* Logo */}
            <div className="text-center mb-6">
              <img src={Logo} alt="euGastei" className="h-[32px] w-auto mx-auto mb-6" />
            </div>
            
            {/* Títulos */}
            <div className="text-center mb-8">
              <h2 className="text-[32px] font-normal text-text">
                Bem vindo de volta!
              </h2>
              <p className="text-[#777777] text-[16px] font-normal mt-1">
                Insira seus dados para fazer login
              </p>
            </div>
            
            {/* Botões sociais */}
            <div className="flex flex-row gap-[20px] mb-6">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-3 px-4 py-3 bg-card/20 border border-border rounded-[8px] text-text/20 text-[16px] font-normal hover:bg-background/5 transition-colors"
              >
                <img src={GoogleIcon} alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-3 px-4 py-3 bg-card/20 border border-border rounded-[8px] text-text/20 text-[16px] font-normal hover:bg-background/5 transition-colors"
              >
                <img src={AppleIcon} alt="Apple" className="w-5 h-5" />
                Apple
              </button>
            </div>
            
            {/* Divider */}
            <hr className="border-t border-border/20 my-10" />
            
            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-danger/10 border border-red-500/50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="block text-[16px] font-normal text-text mb-1">
                  Endereço de email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email..."
                  className="w-full px-4 py-3 bg-input-bg border border-input-border/30 rounded-[8px] text-text placeholder:text-text-muted text-[14px] font-normal focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-[16px] font-normal text-text mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-input-bg border border-input-border/30 rounded-[8px] text-text placeholder:text-text-muted text-[14px] font-normal focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  required
                />
                <div className="flex justify-end mt-2">
                  <Link to="/forgot-password" className="text-[14px] font-normal text-text hover:text-text transition-colors underline">
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full relative mt-6 py-3 px-4 rounded-[8px] bg-primary border border-primary/30 text-text text-[16px] font-normal hover:bg-primary/90 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-tr from-[#2C80FF]/0 to-[#9CC3FF]/20 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                {loading ? (
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin h-5 w-5 text-text" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : "Fazer login"}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-[14px] text-[#777777]">
                Não tem uma conta ainda? <Link to="/register" className="text-text hover:text-[#2C80FF] transition-colors">Cadastre-se agora</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 