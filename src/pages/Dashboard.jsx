import React, { useState, useContext } from 'react';
import { Menu, Plus, Layers, LogOut, Sun, Moon, User, CheckSquare, XSquare, Trash } from 'lucide-react';
import { Modal, Flashcard } from '../components/Shared';
import { ThemeContext, AuthContext, DataContext } from '../context/providers';

const Dashboard = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  
  // Destructure new actions
  const { 
    categories, flashcards, loading, 
    addCategory, addFlashcard, updateFlashcard, deleteFlashcard, bulkDeleteFlashcards 
  } = useContext(DataContext);

  // UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false); // Bulk Mode
  const [selectedIds, setSelectedIds] = useState([]); // Selected IDs for bulk delete

  // Modal States
  const [isCreateCardOpen, setCreateCardOpen] = useState(false);
  const [isEditCardOpen, setEditCardOpen] = useState(false); // Edit Mode
  const [isCreateCatOpen, setCreateCatOpen] = useState(false);

  // Forms
  const [cardForm, setCardForm] = useState({ id: null, q: '', a: '', cat: '' });
  const [catForm, setCatForm] = useState({ name: '', parent: '' });

  // Helpers
  const getParentId = (c) => c.parent_id || c.parentId;
  const getCategoryId = (f) => f.category_id || f.categoryId;

  const renderCategories = (parentId = null, depth = 0) => {
    return categories
      .filter(c => getParentId(c) == parentId)
      .map(c => (
        <div key={c.id}>
          <div 
            className="category-item" 
            style={{paddingLeft: `${depth * 15 + 10}px`, fontWeight: selectedCategory == c.id ? 'bold' : 'normal'}}
            onClick={() => { setSelectedCategory(c.id); setSidebarOpen(false); }}
          >
            {c.name}
          </div>
          {renderCategories(c.id, depth + 1)}
        </div>
      ));
  };

  const filteredCards = selectedCategory 
    ? flashcards.filter(f => getCategoryId(f) == selectedCategory) 
    : flashcards;

  // --- HANDLERS ---

  // 1. Open Edit Modal
  const openEdit = (card) => {
    setCardForm({ id: card.id, q: card.question, a: card.answer, cat: getCategoryId(card) });
    setEditCardOpen(true);
  };

  // 2. Open Create Modal
  const openCreate = () => {
    setCardForm({ id: null, q: '', a: '', cat: selectedCategory || '' });
    setCreateCardOpen(true);
  };

  // 3. Submit (Create or Update)
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    if (isEditCardOpen) {
      await updateFlashcard(cardForm.id, cardForm.q, cardForm.a, cardForm.cat);
      setEditCardOpen(false);
    } else {
      await addFlashcard(cardForm.q, cardForm.a, cardForm.cat);
      setCreateCardOpen(false);
    }
  };

  // 4. Single Delete
  const handleDelete = async (id) => {
    if (window.confirm("Delete this card?")) {
      await deleteFlashcard(id);
    }
  };

  // 5. Bulk Logic
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(i => i !== id));
    else setSelectedIds(prev => [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedIds.length} cards?`)) {
      await bulkDeleteFlashcards(selectedIds);
      setSelectedIds([]);
      setSelectionMode(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">FlashMind.</div>
        <div style={{flex:1, overflowY:'auto'}}>
          <div className="category-item" onClick={() => setSelectedCategory(null)}>All Cards</div>
          <hr style={{borderColor:'var(--border)', margin:'1rem 0'}} />
          {renderCategories()}
        </div>
        <div style={{marginTop:'auto', paddingTop:'1rem', borderTop:'1px solid var(--border)'}}>
           <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1rem'}}>
             <User size={20} /> <span>{user ? 'User' : 'Guest'}</span>
           </div>
           <button className="btn btn-outline" style={{width:'100%'}} onClick={logout}><LogOut size={16}/> Logout</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <nav className="top-nav">
          <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
            <button className="btn-text mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={24}/></button>
            <h2 style={{margin:0, fontSize:'1.25rem'}}>
               {categories.find(c => c.id == selectedCategory)?.name || 'All Flashcards'}
            </h2>
          </div>
          <div style={{display:'flex', gap:'0.5rem'}}>
            
            {/* BULK DELETE TOGGLE */}
            {selectionMode ? (
              <>
                 <button className="btn btn-text" onClick={() => { setSelectionMode(false); setSelectedIds([]); }}>
                   <XSquare size={20}/> Cancel
                 </button>
                 <button 
                   className="btn btn-primary" 
                   style={{backgroundColor: 'var(--danger)'}}
                   onClick={handleBulkDelete}
                   disabled={selectedIds.length === 0}
                 >
                   <Trash size={18}/> Delete ({selectedIds.length})
                 </button>
              </>
            ) : (
              <button className="btn btn-text" onClick={() => setSelectionMode(true)} title="Bulk Select">
                <CheckSquare size={20}/>
              </button>
            )}

            <button className="btn btn-text" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
            </button>
            <button className="btn btn-outline" onClick={() => setCreateCatOpen(true)}><Layers size={18}/></button>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={18}/> Create</button>
          </div>
        </nav>

        <div className="content-area">
          <div className="flashcard-grid">
            {filteredCards.map(card => (
              <Flashcard 
                key={card.id} 
                data={card} 
                onEdit={openEdit}
                onDelete={handleDelete}
                selectionMode={selectionMode}
                isSelected={selectedIds.includes(card.id)}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        </div>
      </main>

      {/* CARD MODAL (REUSED FOR CREATE & EDIT) */}
      <Modal 
        isOpen={isCreateCardOpen || isEditCardOpen} 
        onClose={() => { setCreateCardOpen(false); setEditCardOpen(false); }} 
        title={isEditCardOpen ? "Edit Flashcard" : "New Flashcard"}
      >
        <form onSubmit={handleCardSubmit}>
            <input className="input-field" placeholder="Question" value={cardForm.q} onChange={e=>setCardForm({...cardForm, q: e.target.value})} required />
            <textarea className="input-field" placeholder="Answer" rows="3" value={cardForm.a} onChange={e=>setCardForm({...cardForm, a: e.target.value})} required />
            <select className="input-field" value={cardForm.cat} onChange={e=>setCardForm({...cardForm, cat: e.target.value})} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="btn btn-primary" style={{width:'100%'}}>
              {isEditCardOpen ? "Update" : "Create"}
            </button>
        </form>
      </Modal>

      {/* CATEGORY MODAL */}
      <Modal isOpen={isCreateCatOpen} onClose={() => setCreateCatOpen(false)} title="New Category">
         <form onSubmit={async (e) => {
            e.preventDefault();
            await addCategory(catForm.name, catForm.parent || null);
            setCreateCatOpen(false);
            setCatForm({ name: '', parent: '' });
         }}>
            <input className="input-field" placeholder="Name" value={catForm.name} onChange={e=>setCatForm({...catForm, name: e.target.value})} required />
            <select className="input-field" value={catForm.parent} onChange={e=>setCatForm({...catForm, parent: e.target.value})}>
                <option value="">No Parent</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="btn btn-primary" style={{width:'100%'}}>Create</button>
         </form>
      </Modal>
    </div>
  );
};

export default Dashboard;