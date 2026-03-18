import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAdminOperations } from '@/hooks/useAdminOperations';
import { OperationsSidebar } from '@/components/admin/OperationsSidebar';
import { OperationsMap } from '@/components/admin/OperationsMap';

export default function Operations() {
  const ops = useAdminOperations();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="h-12 border-b border-border flex items-center px-4 shrink-0 bg-card">
        <Link to="/admin" className="mr-3 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-sm font-semibold text-foreground">Central de Operações</h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {ops.counts.online} online · {ops.counts.em_rota} em rota
          </span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {/* Split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar 35% */}
        <div className="w-[35%] min-w-[320px] max-w-[480px] shrink-0">
          <OperationsSidebar
            drivers={ops.drivers}
            filter={ops.filter}
            setFilter={ops.setFilter}
            counts={ops.counts}
            loading={ops.loading}
            selectedId={selectedId}
            onSelectDriver={setSelectedId}
          />
        </div>

        {/* Map 65% */}
        <div className="flex-1">
          <OperationsMap drivers={ops.allDrivers} selectedId={selectedId} />
        </div>
      </div>
    </div>
  );
}
