import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import PatientGridView from './PatientGridView';
import PatientListView from './PatientListView';
import { usePatients } from '../context/PatientContext';
import type { ViewMode } from './ViewToggle';
import ViewToggle from './ViewToggle';
import PatientGridSkeleton from './skeletons/PatientGridSkeleton';
import PatientListSkeleton from './skeletons/PatientListSkeleton';
import FilterSegmentedControl from './FilterSegmentedControl';
import { useAuth } from '../hooks/useAuth';
import { PlusIcon } from '../../../components/icons';

const PatientListContainer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Archived' | 'All'>('Active');
  const { state: { list: allPatients, loading } } = usePatients();
  const { user } = useAuth();

  const filteredPatients = useMemo(() => {
    let patients = allPatients;

    if (statusFilter === 'Active') {
        patients = patients.filter(p => !p.archived);
    } else if (statusFilter === 'Archived') {
        patients = patients.filter(p => p.archived);
    }

    if (searchTerm) {
        patients = patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return patients;
  }, [allPatients, statusFilter, searchTerm]);

  const renderContent = () => {
    if (loading) {
      return viewMode === 'grid' ? <PatientGridSkeleton /> : <PatientListSkeleton />;
    }

    if (filteredPatients.length === 0) {
      return (
        <div className="flex justify-center items-center h-64 text-slate-500 card-panel">
            No patients match the current filters.
        </div>
      );
    }

    return viewMode === 'grid'
      ? <PatientGridView patients={filteredPatients} />
      : <PatientListView patients={filteredPatients} />;
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">All Patients</h1>
          <p className="text-slate-600 mt-1">Welcome back, {user ? user.name : '...'}</p>
        </div>
        <Link to="/patients/new" className="btn-neu flex items-center space-x-2 text-sky-600">
          <PlusIcon className="h-5 w-5" />
          <span>Add Patient</span>
        </Link>
      </header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 flex-shrink-0">
        <FilterSegmentedControl activeFilter={statusFilter} onFilterChange={setStatusFilter} />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <SearchBar searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>
      
      {/* Patient List */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-autohide">
        {renderContent()}
      </div>
    </div>
  );
};

export default PatientListContainer;