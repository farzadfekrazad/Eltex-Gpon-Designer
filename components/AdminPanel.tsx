
import React, { useState } from 'react';
import type { OltDevice, OntDevice, User } from '../types';
import DeviceEditModal from './DeviceEditModal';
import ImportExport from './ImportExport';
import UserManagement from './UserManagement';
import TranslationEditor from './TranslationEditor';
import SmtpSettings from './SmtpSettings';
import DatabaseManagement from './DatabaseManagement';
import { useI18n } from '../contexts/I18nContext';

interface AdminPanelProps {
  currentUser: User;
  oltDevices: OltDevice[];
  ontDevices: OntDevice[];
  users: User[]; // This will now be read-only display, management is in the component
  onUpdate: (type: 'olt' | 'ont', device: OltDevice | OntDevice) => Promise<void>;
  onAdd: (type: 'olt' | 'ont', device: Omit<OltDevice, 'id'> | Omit<OntDevice, 'id'>) => Promise<void>;
  onDelete: (type: 'olt' | 'ont', deviceId: string) => Promise<void>;
  onCatalogImport: (data: { olts: OltDevice[], onts: OntDevice[] }) => Promise<void>;
}

type ActiveTab = 'devices' | 'users' | 'translations' | 'settings';

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, oltDevices, ontDevices, users, onUpdate, onAdd, onDelete, onCatalogImport }) => {
  const { t } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<OltDevice | OntDevice | null>(null);
  const [deviceType, setDeviceType] = useState<'olt' | 'ont'>('olt');
  const [activeTab, setActiveTab] = useState<ActiveTab>('devices');

  const isReadonly = currentUser.role === 'readonly_admin';

  const handleEdit = (device: OltDevice | OntDevice, type: 'olt' | 'ont') => {
    if (isReadonly) return;
    setEditingDevice(device);
    setDeviceType(type);
    setModalOpen(true);
  };
  
  const handleAddNew = (type: 'olt' | 'ont') => {
    if (isReadonly) return;
    setEditingDevice(null);
    setDeviceType(type);
    setModalOpen(true);
  };

  const handleSave = async (deviceData: Omit<OltDevice, 'id'> | Omit<OntDevice, 'id'> | OltDevice | OntDevice) => {
    if (isReadonly) return;
    if (editingDevice && 'id' in deviceData) {
      await onUpdate(deviceType, deviceData as OltDevice | OntDevice);
    } else {
      await onAdd(deviceType, deviceData as Omit<OltDevice, 'id'> | Omit<OntDevice, 'id'>);
    }
    setModalOpen(false);
  };

  const handleDelete = async (type: 'olt' | 'ont', deviceId: string) => {
    if (isReadonly) return;
    if (window.confirm(t('admin.deleteConfirm'))) {
        await onDelete(type, deviceId);
    }
  }

  const renderOltTable = () => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyan-400">{t('admin.oltDevices')}</h2>
        {!isReadonly && <button onClick={() => handleAddNew('olt')} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
          {t('admin.addOlt')}
        </button>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-start text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">{t('admin.table.model')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.table.technology')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.table.uplinks')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.table.description')}</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">{t('admin.table.actions')}</span></th>
            </tr>
          </thead>
          <tbody>
            {oltDevices.map(device => (
              <tr key={device.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{device.model}</th>
                <td className="px-6 py-4">{device.technology}</td>
                <td className="px-6 py-4">{device.uplinkPorts.map(p => `${p.count}x ${p.type}`).join(', ')}</td>
                <td className="px-6 py-4 truncate max-w-xs">{device.description}</td>
                <td className="px-6 py-4 text-end space-x-2 whitespace-nowrap">
                  <button onClick={() => handleEdit(device, 'olt')} className={`font-medium ${isReadonly ? 'text-gray-500 cursor-not-allowed' : 'text-cyan-400 hover:underline'}`}>{t('admin.edit')}</button>
                  <button onClick={() => handleDelete('olt', device.id)} className={`font-medium ${isReadonly ? 'text-gray-500 cursor-not-allowed' : 'text-red-500 hover:underline'}`}>{t('admin.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const renderOntTable = () => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyan-400">{t('admin.ontDevices')}</h2>
         {!isReadonly && <button onClick={() => handleAddNew('ont')} className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
          {t('admin.addOnt')}
        </button>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-start text-gray-400">
          <thead className="text-xs text-gray-300 uppercase bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3">{t('admin.table.model')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.table.technology')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.table.ports')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.table.wifi')}</th>
              <th scope="col" className="px-6 py-3"><span className="sr-only">{t('admin.table.actions')}</span></th>
            </tr>
          </thead>
          <tbody>
            {ontDevices.map(device => (
              <tr key={device.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{device.model}</th>
                <td className="px-6 py-4">{device.technology}</td>
                <td className="px-6 py-4">
                    {device.ethernetPorts.map(p => `${p.count}x ${p.type}`).join(', ')}
                    {device.fxsPorts > 0 && `, ${device.fxsPorts}x FXS`}
                </td>
                <td className="px-6 py-4">{device.wifi ? `${device.wifi.standard} (${device.wifi.bands})` : 'N/A'}</td>
                <td className="px-6 py-4 text-end space-x-2 whitespace-nowrap">
                  <button onClick={() => handleEdit(device, 'ont')} className={`font-medium ${isReadonly ? 'text-gray-500 cursor-not-allowed' : 'text-cyan-400 hover:underline'}`}>{t('admin.edit')}</button>
                  <button onClick={() => handleDelete('ont', device.id)} className={`font-medium ${isReadonly ? 'text-gray-500 cursor-not-allowed' : 'text-red-500 hover:underline'}`}>{t('admin.delete')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b-2 border-gray-700">
        <button onClick={() => setActiveTab('devices')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'devices' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>
          {t('admin.manageDevices')}
        </button>
        {currentUser.role === 'admin' && (
           <>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'users' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>
                {t('admin.manageUsers')}
            </button>
            <button onClick={() => setActiveTab('translations')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'translations' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>
                {t('admin.manageTranslations')}
            </button>
            <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-lg font-semibold ${activeTab === 'settings' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'}`}>
                {t('admin.manageSettings')}
            </button>
           </>
        )}
      </div>

      {activeTab === 'devices' && (
        <div className="space-y-6">
          <ImportExport
            oltDevices={oltDevices}
            ontDevices={ontDevices}
            onImport={onCatalogImport}
            disabled={isReadonly}
          />
          {renderOltTable()}
          {renderOntTable()}
        </div>
      )}
      
      {activeTab === 'users' && currentUser.role === 'admin' && (
          <UserManagement initialUsers={users} />
      )}

      {activeTab === 'translations' && currentUser.role === 'admin' && (
          <TranslationEditor />
      )}

      {activeTab === 'settings' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            <SmtpSettings />
            <DatabaseManagement />
          </div>
      )}

      {modalOpen && (
        <DeviceEditModal
          device={editingDevice}
          type={deviceType}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
