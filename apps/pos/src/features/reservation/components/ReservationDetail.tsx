import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  Calendar, 
  Clock, 
  Users, 
  Mail, 
  MessageSquare,
  AlertTriangle,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { reservationsApi, tablesApi } from '@/lib/api';
import { Reservation, Table } from '../types';

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface ReservationDetailProps {
  isSidebarCollapsed?: boolean;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

// Generate WhatsApp link with pre-filled message
const generateWhatsAppLink = (reservation: Reservation): string => {
  // Format phone number
  let phone = reservation.whatsapp.replace(/\D/g, '');
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1);
  }
  if (!phone.startsWith('62')) {
    phone = '62' + phone;
  }

  // Generate booking ID
  const bookingId = `#R-${reservation._id.slice(-6).toUpperCase()}`;
  
  // Format date
  const dateObj = new Date(reservation.date);
  const formattedDate = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Create message
  const message = `Halo *${reservation.guest_name}*,

Terima kasih telah melakukan reservasi di restoran kami.

📋 *Detail Reservasi:*
• Booking ID: *${bookingId}*
• Nama: *${reservation.guest_name}*
• Tanggal: *${formattedDate}*
• Jam: *${reservation.time}*
• Jumlah Tamu: *${reservation.pax} orang*

Kami tunggu kedatangan Anda. Terima kasih! 🙏`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

export const ReservationDetail: React.FC<ReservationDetailProps> = ({
  isMobile = false,
  onToggleSidebar = () => {},
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [resResponse, tablesResponse] = await Promise.all([
          reservationsApi.getById(id),
          tablesApi.getAll({ available_only: 'true' })
        ]);

        if (resResponse.data.success && resResponse.data.data) {
          setReservation(resResponse.data.data as Reservation);
        }
        
        if (tablesResponse.data.success && tablesResponse.data.data) {
          setTables(tablesResponse.data.data as Table[]);
        }
      } catch (err) {
        console.error('Failed to fetch reservation:', err);
        setError(t('reservation.failedToLoad'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBack = () => {
    navigate('/reservation');
  };

  const handleApprove = async () => {
    if (!reservation) return;
    
    setIsProcessing(true);
    try {
      const response = await reservationsApi.approve(reservation._id, {
        table_id: selectedTableId || undefined,
        admin_notes: adminNotes || undefined
      });

      if (response.data.success) {
        setReservation(response.data.data as Reservation);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('reservation.failedToApprove'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reservation) return;
    
    if (!window.confirm(t('reservation.confirmReject'))) return;
    
    setIsProcessing(true);
    try {
      const response = await reservationsApi.reject(reservation._id, adminNotes || undefined);

      if (response.data.success) {
        setReservation(response.data.data as Reservation);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || t('reservation.failedToReject'));
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'PENDING':
        return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'COMPLETED':
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusLabel = (status: Reservation['status']) => {
    switch (status) {
      case 'APPROVED': return 'Disetujui';
      case 'PENDING': return 'Menunggu';
      case 'REJECTED': return 'Ditolak';
      case 'CANCELLED': return 'Dibatalkan';
      case 'COMPLETED': return 'Selesai';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-background min-h-screen">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button onClick={onToggleSidebar} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl font-semibold text-foreground">Memuat...</h1>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex-1 bg-background min-h-screen">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button onClick={onToggleSidebar} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-xl font-semibold text-foreground">Reservasi Tidak Ditemukan</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium text-foreground mb-2">Reservasi Tidak Ditemukan</h2>
          <p className="text-muted-foreground mb-4">Reservasi yang Anda cari tidak ada.</p>
          <button onClick={handleBack} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
            Kembali ke Daftar Reservasi
          </button>
        </div>
      </div>
    );
  }

  const tableInfo = typeof reservation.table_id === 'object' && reservation.table_id ? reservation.table_id : null;

  return (
    <div className="flex-1 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <button onClick={onToggleSidebar} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Detail Reservasi</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola informasi reservasi</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reservation.status)}`}>
            {getStatusLabel(reservation.status)}
          </div>
          <button onClick={handleBack} className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-muted/30">
        {/* Hero */}
        <div className="h-40 bg-gradient-to-r from-red-500 to-red-600 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-2xl font-bold">{reservation.guest_name}</h2>
            <p className="text-red-100 mt-1">
              {reservation.pax} tamu • {reservation.time} • {new Date(reservation.date).toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Content Cards */}
        <div className="px-4 sm:px-6 py-6 -mt-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Reservation Information */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Informasi Reservasi
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{reservation.pax} Tamu</p>
                    <p className="text-xs text-muted-foreground">Jumlah tamu</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(reservation.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">Tanggal reservasi</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{reservation.time}</p>
                    <p className="text-xs text-muted-foreground">Jam reservasi</p>
                  </div>
                </div>

                {tableInfo && (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-primary/20 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{tableInfo.number}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tableInfo.name || `Meja ${tableInfo.number}`}
                      </p>
                      <p className="text-xs text-muted-foreground">Kapasitas {tableInfo.capacity} orang</p>
                    </div>
                  </div>
                )}

                {reservation.notes && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Catatan Tamu</p>
                      <p className="text-sm text-muted-foreground bg-muted rounded-md p-3">{reservation.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Informasi Tamu
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{reservation.guest_name}</p>
                  <p className="text-xs text-muted-foreground">Nama tamu</p>
                </div>
                
                {/* WhatsApp clickable */}
                <div className="flex items-center gap-3">
                  <WhatsAppIcon className="w-4 h-4 text-green-500" />
                  <div>
                    <a
                      href={generateWhatsAppLink(reservation)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:underline flex items-center gap-2"
                    >
                      {reservation.whatsapp}
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                        Chat
                      </span>
                    </a>
                    <p className="text-xs text-muted-foreground">Klik untuk chat WhatsApp</p>
                  </div>
                </div>
                
                {reservation.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{reservation.email}</p>
                      <p className="text-xs text-muted-foreground">Email</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground">
                    Dibuat pada {new Date(reservation.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section for Pending Reservations */}
          {reservation.status === 'PENDING' && (
            <div className="mt-6 bg-card rounded-lg shadow-sm border border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Tindakan</h3>
              
              <div className="space-y-4">
                {/* Table Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Pilih Meja (Opsional)
                  </label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">-- Pilih Meja --</option>
                    {tables.map(table => (
                      <option key={table._id} value={table._id}>
                        {table.name || `Meja ${table.number}`} (Kapasitas: {table.capacity})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Catatan Admin (Opsional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                    placeholder="Catatan untuk tamu atau internal..."
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Tolak
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Setujui
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Notes Display */}
          {reservation.admin_notes && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Catatan Admin:</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">{reservation.admin_notes}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
