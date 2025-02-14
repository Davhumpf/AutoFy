import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Upload, Send, Clock, Calendar, Download, Activity, AlertCircle, HelpCircle, LogOut, Copy, ExternalLink } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

interface PaymentHistoryItem {
  date: string;
  amount: number;
  status: string;
  method: string;
}

interface Group {
  id: string;
  name: string;
  renewalDate: string;
  members: string[];
}

export default function UserDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ preview: string; file: File } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [userGroup, setUserGroup] = useState<Group | null>(null);

  const paymentHistory: PaymentHistoryItem[] = [
    { date: '2024-02-01', amount: 50000, status: 'completed', method: 'Nequi' },
    { date: '2024-01-01', amount: 50000, status: 'completed', method: 'Daviplata' },
  ];

  // Obtener el grupo asignado al usuario
  useEffect(() => {
    if (user?.groupId) {
      const groupRef = doc(db, 'groups', user.groupId);
      const unsubscribe = onSnapshot(groupRef, (doc) => {
        if (doc.exists()) {
          setUserGroup({ id: doc.id, ...doc.data() } as Group);
        } else {
          setUserGroup(null);
        }
      });

      return () => unsubscribe();
    }
  }, [user?.groupId]);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('318 865 69 61');
    toast.success('Número copiado al portapapeles');
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      completed: 'text-green-500',
      pending: 'text-yellow-500',
      failed: 'text-red-500',
      active: 'text-green-500',
    };
    return statusColors[status as keyof typeof statusColors] || 'text-gray-500';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewFile({
          preview: reader.result as string,
          file: file,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadReceipt = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Comprobante de pago enviado con éxito');
      setLoading(false);
      setShowUploadForm(false);
      setPreviewFile(null);
    }, 2000);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('authSession');
      toast.success('Sesión cerrada exitosamente');
      navigate('/');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const handlePaymentMethodClick = (method: string) => {
    setSelectedPaymentMethod(method);
    setShowPaymentModal(true);
  };

  const PaymentInstructionsModal = () => {
    const instructions = {
      Nequi: [
        "Abre tu app Nequi",
        'Selecciona la opción "envia" y luego "nequi"',
        <>Escribe el monto a pagar y envíalo al siguiente número:
          <div className="flex items-center gap-2 bg-gray-700 p-2 rounded mt-2">
            <span className="text-gray-300">318 865 69 61</span>
            <button
              onClick={handleCopyNumber}
              className="text-[#57A639] hover:text-[#4CAF50]"
            >
              <Copy size={16} />
            </button>
          </div>
        </>,
        <div className="flex items-center gap-2">
          Adjuntar comprobante
          <a
            href="https://wa.me/573027214125"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#57A639] hover:text-[#4CAF50]"
          >
            <span>Enviar comprobante</span>
            <ExternalLink size={16} />
          </a>
        </div>,
      ],
      Daviplata: [
        "Abre tu app Daviplata",
        'Selecciona la opción "Pasar Plata" y luego "A Daviplata"',
        <>Escribe el número:
          <div className="flex items-center gap-2 bg-gray-700 p-2 rounded mt-2">
            <span className="text-gray-300">318 865 69 61</span>
            <button
              onClick={handleCopyNumber}
              className="text-[#57A639] hover:text-[#4CAF50]"
            >
              <Copy size={16} />
            </button>
          </div>
        </>,
        "Escribe el monto a pagar",
        <div className="flex items-center gap-2">
          Adjuntar comprobante
          <a
            href="https://wa.me/573027214125"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#57A639] hover:text-[#4CAF50]"
          >
            <span>Enviar comprobante</span>
            <ExternalLink size={16} />
          </a>
        </div>,
      ],
      Rappi: [
        "Abre tu app Rappi",
        "Selecciona Rappi cuenta",
        'Selecciona "enviar dinero" y "contactos rappi"',
        'Selecciona el botón "enviar a otro"',
        <>Escribe el número:
          <div className="flex items-center gap-2 bg-gray-700 p-2 rounded mt-2">
            <span className="text-gray-300">318 865 69 61</span>
            <button
              onClick={handleCopyNumber}
              className="text-[#57A639] hover:text-[#4CAF50]"
            >
              <Copy size={16} />
            </button>
          </div>
        </>,
        <div className="flex items-center gap-2">
          Adjuntar comprobante
          <a
            href="https://wa.me/573027214125"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#57A639] hover:text-[#4CAF50]"
          >
            <span>Enviar comprobante</span>
            <ExternalLink size={16} />
          </a>
        </div>,
      ],
    };

    if (!selectedPaymentMethod) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#2a2b31] p-6 rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white">
              Pagar con {selectedPaymentMethod}
            </h3>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-4">
            {instructions[selectedPaymentMethod as keyof typeof instructions]?.map((instruction, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#57A639] text-white flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="text-gray-300">{instruction}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1b1f]">
      <header className="bg-[#2a2b31] border-b border-gray-700 p-4 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">
            Hola {user?.email?.split('@')[0] || 'Usuario'}, bienvenido a tu dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <a
              href="https://wa.me/573027214125"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#57A639] text-white hover:bg-[#4CAF50] transition-colors">
                <HelpCircle size={24} />
              </div>
              <span className="text-xs text-white">¿Soporte?</span>
            </a>
            <button
              onClick={handleSignOut}
              className="flex flex-col items-center"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white hover:bg-red-500 transition-colors">
                <LogOut size={24} />
              </div>
              <span className="text-xs text-white">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {user?.status === 'pending' && (
          <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-yellow-500" size={24} />
            <p className="text-yellow-500">
              Tu cuenta está pendiente de aprobación. Por favor, espera a que un administrador la active.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Grupo */}
          <div className="bg-[#2a2b31] rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={20} className="text-white" />
              <h2 className="text-xl font-bold text-white">Información del Grupo</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Estado</span>
                <span className={`font-medium ${getStatusColor(user?.status || 'pending')}`}>
                  {user?.status === 'approved' ? 'Activo' : 'Pendiente'}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Progreso del periodo</span>
                  <span>0%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#57A639] h-2 rounded-full transition-all duration-300"
                    style={{ width: '0%' }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Próximo pago</span>
                <div className="flex items-center gap-2 text-white">
                  <Calendar size={16} />
                  <span>
                    {userGroup?.renewalDate
                      ? new Date(userGroup.renewalDate).toLocaleDateString()
                      : 'Pendiente de asignación'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Grupo</span>
                <span className="text-white">
                  {userGroup?.name || 'Pendiente de asignación'}
                </span>
              </div>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div className="bg-[#2a2b31] rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Métodos de Pago</h2>
            <div className="space-y-4">
              {['Nequi', 'Daviplata', 'Rappi'].map((method) => (
                <button
                  key={method}
                  onClick={() => handlePaymentMethodClick(method)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all bg-[#1a1b1f] text-gray-300 hover:bg-[#57A639] hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <CreditCard size={20} />
                    {method}
                  </span>
                  <Send size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Historial de Pagos */}
        <div className="bg-[#2a2b31] rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Historial de Pagos</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700">
                  <th className="pb-3 text-gray-400">Fecha</th>
                  <th className="pb-3 text-gray-400">Monto</th>
                  <th className="pb-3 text-gray-400">Método</th>
                  <th className="pb-3 text-gray-400">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="py-3 text-white">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-white">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="py-3 text-white">{payment.method}</td>
                    <td className={`py-3 ${getStatusColor(payment.status)}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de carga de comprobante */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#2a2b31] p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Subir Comprobante de Pago</h3>
              <form onSubmit={handleUploadReceipt} className="space-y-4">
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      required
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <Upload size={24} className="text-gray-400" />
                      <span className="text-gray-400">Click para seleccionar o arrastra tu archivo aquí</span>
                    </label>
                  </div>

                  {previewFile && (
                    <div className="mt-4">
                      <p className="text-gray-300 mb-2">Vista previa:</p>
                      {previewFile.file.type.startsWith('image/') ? (
                        <img
                          src={previewFile.preview}
                          alt="Preview"
                          className="max-h-40 rounded-lg mx-auto"
                        />
                      ) : (
                        <div className="bg-gray-700 p-4 rounded-lg text-center text-gray-300">
                          {previewFile.file.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadForm(false);
                      setPreviewFile(null);
                    }}
                    className="px-4 py-2 text-gray-300 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !previewFile}
                    className="px-4 py-2 bg-[#57A639] text-white rounded-lg hover:bg-[#4CAF50] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enviando...' : 'Enviar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Instrucciones de Pago */}
        {showPaymentModal && <PaymentInstructionsModal />}
      </main>
    </div>
  );
}