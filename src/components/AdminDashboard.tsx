import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Check, Trash2, LogOut } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  status: string;
  createdAt: string;
  groupId?: string;
}

interface Group {
  id: string;
  name: string;
  renewalDate: string;
  members: string[];
}

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDate, setNewGroupDate] = useState('');

  useEffect(() => {
    if (!user || user.email !== 'scpu.v1@gmail.com') {
      navigate('/login');
      return;
    }
    loadPendingUsers();
    loadGroups();
  }, [user, navigate]);

  const loadPendingUsers = async () => {
    const q = query(collection(db, 'users'), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as User);
    });
    setPendingUsers(users);
  };

  const loadGroups = async () => {
    const querySnapshot = await getDocs(collection(db, 'groups'));
    const groupsData: Group[] = [];
    querySnapshot.forEach((doc) => {
      groupsData.push({ id: doc.id, ...doc.data() } as Group);
    });
    setGroups(groupsData);
  };

  const handleApproveUser = async (userId: string) => {
    if (!selectedGroup) {
      toast.error('Por favor selecciona un grupo');
      return;
    }

    const groupRef = doc(db, 'groups', selectedGroup);
    const userRef = doc(db, 'users', userId);

    try {
      await updateDoc(userRef, {
        status: 'approved',
        groupId: selectedGroup,
      });

      await updateDoc(groupRef, {
        members: [...groups.find((g) => g.id === selectedGroup)?.members || [], userId],
      });

      toast.success('Usuario aprobado y asignado al grupo');
      loadPendingUsers();
      loadGroups();
    } catch (error) {
      toast.error('Error al aprobar usuario');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || !newGroupDate) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      const groupRef = doc(collection(db, 'groups'));
      await setDoc(groupRef, {
        name: newGroupName,
        renewalDate: newGroupDate,
        members: [],
      });

      toast.success('Grupo creado exitosamente');
      setShowCreateGroup(false);
      setNewGroupName('');
      setNewGroupDate('');
      loadGroups();
    } catch (error) {
      toast.error('Error al crear grupo');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este grupo?')) {
      try {
        await deleteDoc(doc(db, 'groups', groupId));
        toast.success('Grupo eliminado exitosamente');
        loadGroups();
      } catch (error) {
        toast.error('Error al eliminar grupo');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      toast.error('Error al cerrar sesión');
    }
  };

  const filteredUsers = pendingUsers.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1a1b1f]">
      <header className="bg-[#2a2b31] border-b border-gray-700 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-2 gap-6">
        {/* Lista de espera */}
        <div className="bg-[#2a2b31] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Lista de Espera</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por correo"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1a1b1f] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#57A639]"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-[#1a1b1f] p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-white">{user.email}</p>
                  <p className="text-sm text-gray-400">
                    Registrado: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    className="bg-[#2a2b31] text-white p-2 rounded-lg"
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    value={selectedGroup}
                  >
                    <option value="">Seleccionar grupo</option>
                    {groups.filter((g) => g.members.length < 6).map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleApproveUser(user.id)}
                    className="bg-[#57A639] text-white p-2 rounded-lg hover:bg-[#4CAF50]"
                  >
                    <Check size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gestión de grupos */}
        <div className="bg-[#2a2b31] rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Grupos</h2>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-2 bg-[#57A639] text-white px-4 py-2 rounded-lg hover:bg-[#4CAF50]"
            >
              <Plus size={20} />
              Crear Grupo
            </button>
          </div>

          {showCreateGroup && (
            <div className="bg-[#1a1b1f] p-4 rounded-lg mb-4">
              <input
                type="text"
                placeholder="Nombre del grupo"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full mb-2 p-2 bg-[#2a2b31] text-white rounded-lg"
              />
              <input
                type="date"
                value={newGroupDate}
                onChange={(e) => setNewGroupDate(e.target.value)}
                className="w-full mb-2 p-2 bg-[#2a2b31] text-white rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateGroup(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="bg-[#57A639] text-white px-4 py-2 rounded-lg hover:bg-[#4CAF50]"
                >
                  Crear
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.id} className="bg-[#1a1b1f] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <p className="text-gray-400">
                  Renovación: {new Date(group.renewalDate).toLocaleDateString()}
                </p>
                <p className="text-gray-400">
                  Miembros: {group.members.length}/6
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}