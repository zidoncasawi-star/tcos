import React, { useState, useEffect } from 'react';
import { Channel, Program, IptvPlan, Order } from '../types';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { RefreshCw, CheckCircle2, Clock, DollarSign, ShoppingBag, ShieldCheck, Database, Edit3, Trash2, Plus, AlertCircle, Save } from 'lucide-react';

interface Props {
  channels: Channel[];
  programs: Program[];
  iptvPlans: IptvPlan[];
  onNavigate: (path: string) => void;
  onRefreshData: () => void;
}

export const AdminPage: React.FC<Props> = ({
  channels,
  programs,
  iptvPlans,
  onNavigate,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'epg' | 'plans'>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  
  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ message?: string; count?: number } | null>(null);
  const [epgSourceUrl, setEpgSourceUrl] = useState('https://xmltv.fr/guide/tnt.xml');

  // New program form state
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [newProgChannel, setNewProgChannel] = useState(channels[0]?.id || '');
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgStart, setNewProgStart] = useState('21:10');
  const [newProgEnd, setNewProgEnd] = useState('23:00');
  const [newProgGenre, setNewProgGenre] = useState('Divertissement');
  const [newProgCategory, setNewProgCategory] = useState<'divertissement' | 'film' | 'serie' | 'sport' | 'info' | 'documentaire'>('divertissement');
  const [newProgSynopsis, setNewProgSynopsis] = useState('');

  // Editable plans state
  const [localPlans, setLocalPlans] = useState<IptvPlan[]>(iptvPlans);
  const [planSaveStatus, setPlanSaveStatus] = useState('');

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSyncEpg = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/epg/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: epgSourceUrl })
      });
      const data = await res.json();
      setSyncResult(data);
      onRefreshData();
    } catch (e: any) {
      setSyncResult({ message: 'Erreur lors de la synchronisation' });
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgTitle.trim()) return;

    try {
      const res = await fetch('/api/epg/program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: newProgChannel,
          title: newProgTitle,
          startTime: newProgStart,
          endTime: newProgEnd,
          genre: newProgGenre,
          category: newProgCategory,
          synopsis: newProgSynopsis,
          imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=800&q=80',
          isPrimeTime: newProgStart >= '20:45' && newProgStart <= '21:30'
        })
      });

      if (res.ok) {
        alert('Programme ajouté avec succès !');
        setShowAddProgram(false);
        setNewProgTitle('');
        setNewProgSynopsis('');
        onRefreshData();
      }
    } catch (e) {
      alert('Erreur lors de l\'enregistrement');
    }
  };

  // KPIs
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.status === 'paid' || o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid').length;

  const filteredOrders = orderStatusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === orderStatusFilter);

  return (
    <div className="space-y-8 pb-16">
      <Breadcrumbs
        items={[
          { label: 'Accueil', path: '/' },
          { label: 'Administration & Gestion', path: '/admin' }
        ]}
        onNavigate={onNavigate}
      />

      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Database className="w-3.5 h-3.5" />
            <span>Panneau de Contrôle Central</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif">
            Gestion du Guide TV & Commandes IPTV
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supervisez les flux EPG, modifiez la grille et gérez les souscriptions clients.
          </p>
        </div>

        <button
          onClick={handleSyncEpg}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Synchronisation EPG...' : 'Synchroniser EPG maintenant'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs sm:text-sm font-semibold overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Tableau de bord' },
          { id: 'orders', label: `Commandes clients (${orders.length})` },
          { id: 'epg', label: `Gestion EPG (${programs.length} programmes)` },
          { id: 'plans', label: 'Gestion des offres & tarifs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Commandes totales</span>
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-3xl font-black text-slate-900 block">{totalOrders}</span>
              <span className="text-xs text-slate-500">{pendingOrders} commande(s) à traiter</span>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Chiffre d&apos;affaires</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-3xl font-black text-slate-900 block">{totalRevenue.toFixed(2)} €</span>
              <span className="text-xs text-slate-500">Paiements validés</span>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">État EPG</span>
                <Database className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-lg font-bold text-slate-900">Actif & Synchronisé</span>
              </div>
              <span className="text-xs text-slate-500">{channels.length} chaînes • {programs.length} fiches</span>
            </div>
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Commandes récentes</h2>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Voir toutes les commandes &rarr;
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">Aucune commande enregistrée pour l&apos;instant.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Réf</th>
                      <th className="p-3">Client</th>
                      <th className="p-3">Formule</th>
                      <th className="p-3">Montant</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-mono font-bold text-slate-900">{o.id}</td>
                        <td className="p-3">
                          <p className="font-semibold text-slate-800">{o.customerName}</p>
                          <p className="text-[11px] text-slate-400">{o.customerEmail}</p>
                        </td>
                        <td className="p-3 font-medium text-slate-700">{o.planName}</td>
                        <td className="p-3 font-bold text-slate-900">{o.amount.toFixed(2)} €</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            o.status === 'paid' || o.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Gestion des commandes</h2>

            {/* Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Filtrer par statut :</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold"
              >
                <option value="all">Tous ({orders.length})</option>
                <option value="pending">En attente (pending)</option>
                <option value="paid">Payée (paid)</option>
                <option value="processing">En traitement (processing)</option>
                <option value="completed">Terminée / Activée (completed)</option>
                <option value="cancelled">Annulée (cancelled)</option>
                <option value="refunded">Remboursée (refunded)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Réf</th>
                  <th className="p-3">Client & Contact</th>
                  <th className="p-3">Offre & Appareil</th>
                  <th className="p-3">Prix</th>
                  <th className="p-3">Moyen</th>
                  <th className="p-3">Statut actuel</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-400">
                      Aucune commande ne correspond à ce statut.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono font-bold text-slate-900">{o.id}</td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-900">{o.customerName}</p>
                        <p className="text-[11px] text-slate-500">{o.customerEmail}</p>
                        {o.customerPhone && (
                          <p className="text-[11px] text-emerald-600 font-mono">{o.customerPhone}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-slate-800">{o.planName} ({o.durationMonths}m)</p>
                        <p className="text-[11px] text-slate-400">{o.deviceType}</p>
                      </td>
                      <td className="p-3 font-bold text-slate-900">{o.amount.toFixed(2)} €</td>
                      <td className="p-3 uppercase text-[10px] font-bold text-slate-500">{o.paymentMethod}</td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                          className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800"
                        >
                          <option value="pending">pending</option>
                          <option value="paid">paid</option>
                          <option value="processing">processing</option>
                          <option value="completed">completed</option>
                          <option value="cancelled">cancelled</option>
                          <option value="refunded">refunded</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => alert(`Accès renvoyés à ${o.customerEmail}`)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px]"
                        >
                          Renvoyer accès
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EPG MANAGEMENT */}
      {activeTab === 'epg' && (
        <div className="space-y-6">
          {/* EPG Source Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Source et Synchronisation XMLTV / JSON</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700">URL du flux de données EPG :</label>
                <input
                  type="text"
                  value={epgSourceUrl}
                  onChange={(e) => setEpgSourceUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Fréquence automatique :</label>
                <input
                  type="text"
                  disabled
                  value="Toutes les 6 heures (Cron)"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-medium"
                />
              </div>
            </div>

            {syncResult && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                {syncResult.message} ({syncResult.count || 0} programmes synchronisés).
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setShowAddProgram(!showAddProgram)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>{showAddProgram ? 'Masquer formulaire' : 'Ajouter manuellement un programme'}</span>
              </button>

              <button
                onClick={handleSyncEpg}
                disabled={syncing}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 disabled:opacity-50"
              >
                Forcer l&apos;actualisation EPG
              </button>
            </div>
          </div>

          {/* Add Program Manual Form */}
          {showAddProgram && (
            <form onSubmit={handleCreateProgram} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Ajout d&apos;une émission dans la grille</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Chaîne :</label>
                  <select
                    value={newProgChannel}
                    onChange={(e) => setNewProgChannel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    {channels.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (Canal {c.number})</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700">Titre de l&apos;émission :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Les Enfoirés 2026"
                    value={newProgTitle}
                    onChange={(e) => setNewProgTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Heure début :</label>
                  <input
                    type="time"
                    value={newProgStart}
                    onChange={(e) => setNewProgStart(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Heure fin :</label>
                  <input
                    type="time"
                    value={newProgEnd}
                    onChange={(e) => setNewProgEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Catégorie :</label>
                  <select
                    value={newProgCategory}
                    onChange={(e) => {
                      setNewProgCategory(e.target.value as any);
                      setNewProgGenre(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value="divertissement">Divertissement</option>
                    <option value="film">Film</option>
                    <option value="serie">Série</option>
                    <option value="sport">Sport</option>
                    <option value="info">Information</option>
                    <option value="documentaire">Documentaire</option>
                  </select>
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="font-semibold text-slate-700">Synopsis & Description :</label>
                  <textarea
                    rows={2}
                    value={newProgSynopsis}
                    onChange={(e) => setNewProgSynopsis(e.target.value)}
                    placeholder="Résumé du programme..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
              >
                Enregistrer le programme
              </button>
            </form>
          )}

          {/* Programs List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Programmes en base ({programs.length})</h3>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] sticky top-0">
                  <tr>
                    <th className="p-2.5">Chaîne</th>
                    <th className="p-2.5">Horaire</th>
                    <th className="p-2.5">Titre</th>
                    <th className="p-2.5">Genre</th>
                    <th className="p-2.5">Prime</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programs.map(p => {
                    const ch = channels.find(c => c.id === p.channelId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-700">{ch?.name || p.channelId}</td>
                        <td className="p-2.5 font-mono text-slate-500">{p.startTime} - {p.endTime}</td>
                        <td className="p-2.5 font-semibold text-slate-900">{p.title}</td>
                        <td className="p-2.5 text-slate-600">{p.genre}</td>
                        <td className="p-2.5">
                          {p.isPrimeTime ? (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                              21:10
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COMMERCIAL PLANS MANAGEMENT */}
      {activeTab === 'plans' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Tarification & Configuration des offres IPTV</h2>
            {planSaveStatus && (
              <span className="text-xs text-emerald-600 font-bold">{planSaveStatus}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {localPlans.map((plan, idx) => (
              <div key={plan.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{plan.name}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                    {plan.durationMonths} Mois
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Prix en euros (€) :</label>
                  <input
                    type="number"
                    step="0.01"
                    value={plan.price}
                    onChange={(e) => {
                      const updated = [...localPlans];
                      updated[idx] = { ...plan, price: parseFloat(e.target.value) || 0 };
                      setLocalPlans(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Description :</label>
                  <textarea
                    rows={2}
                    value={plan.description}
                    onChange={(e) => {
                      const updated = [...localPlans];
                      updated[idx] = { ...plan, description: e.target.value };
                      setLocalPlans(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600">Badge promotionnel :</label>
                  <input
                    type="text"
                    value={plan.badge || ''}
                    onChange={(e) => {
                      const updated = [...localPlans];
                      updated[idx] = { ...plan, badge: e.target.value };
                      setLocalPlans(updated);
                    }}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setPlanSaveStatus('Modifications enregistrées localement');
                setTimeout(() => setPlanSaveStatus(''), 3000);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les tarifs</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
