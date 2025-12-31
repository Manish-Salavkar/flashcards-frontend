import React, { useState, useContext, useMemo } from 'react';
import { Menu, Plus, Layers, LogOut, Sun, Moon, User, CheckSquare, XSquare, Trash, Zap, Edit2, Search, Play, Download, X, Lock } from 'lucide-react';
import { Modal, Flashcard } from '../components/Shared';
import { ThemeContext, AuthContext, DataContext } from '../context/providers';

const Dashboard = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  
  const { 
    categories, flashcards, loading, 
    addCategory, updateCategory, deleteCategory,
    addFlashcard, updateFlashcard, deleteFlashcard, bulkDeleteFlashcards 
  } = useContext(DataContext);

  // --- UI States ---
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectionMode, setSelectionMode] = useState(false); 
  const [selectedIds, setSelectedIds] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');

  // --- Quiz States ---
  const [quizMode, setQuizMode] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [quizCards, setQuizCards] = useState([]);

  // --- Modal States ---
  const [isCreateCardOpen, setCreateCardOpen] = useState(false);
  const [isEditCardOpen, setEditCardOpen] = useState(false); 
  const [isCreateCatOpen, setCreateCatOpen] = useState(false);
  const [isEditCatOpen, setEditCatOpen] = useState(false);
  
  const [cardForm, setCardForm] = useState({ id: null, q: '', a: '', cat: '' });
  const [catForm, setCatForm] = useState({ id: null, name: '', parent: '' });

  // Helpers
  const getParentId = (c) => c.parent_id || c.parentId;
  const getCategoryId = (f) => f.category_id || f.categoryId;

  // --- FILTERING LOGIC ---
  const filteredCards = useMemo(() => {
    let cards = flashcards;
    if (selectedCategory) {
      cards = cards.filter(f => getCategoryId(f) == selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cards = cards.filter(f => 
        f.question.toLowerCase().includes(q) || 
        f.answer.toLowerCase().includes(q)
      );
    }
    return cards;
  }, [flashcards, selectedCategory, searchQuery]);

  // --- QUIZ LOGIC ---
  const startQuiz = (specificCategoryId = null) => {
    let cardsToPlay = [];

    if (specificCategoryId) {
      cardsToPlay = flashcards.filter(f => getCategoryId(f) == specificCategoryId);
    } else {
      cardsToPlay = filteredCards;
    }

    if (cardsToPlay.length === 0) return alert("No cards available to play!");

    const shuffled = [...cardsToPlay].sort(() => 0.5 - Math.random());
    setQuizCards(shuffled);
    setQuizIndex(0);
    setScore(0);
    setShowScore(false);
    setQuizMode(true);
  };

  const handleQuizAnswer = (correct) => {
    if (correct) setScore(prev => prev + 1);
    
    if (quizIndex + 1 < quizCards.length) {
      setQuizIndex(prev => prev + 1);
    } else {
      setShowScore(true);
    }
  };

  // --- HANDLERS ---
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ categories, flashcards }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `flashmind_backup.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const openEditCard = (card) => { setCardForm({ id: card.id, q: card.question, a: card.answer, cat: getCategoryId(card) }); setEditCardOpen(true); };
  
  // Logic to open Create Category Modal
  const openCreateCategory = () => { setCatForm({id:null, name:'', parent:''}); setCreateCatOpen(true); };
  
  const openCreateCard = () => { setCardForm({ id: null, q: '', a: '', cat: selectedCategory || '' }); setCreateCardOpen(true); };
  
  const handleCardSubmit = async (e) => {
    e.preventDefault();
    if (isEditCardOpen) { await updateFlashcard(cardForm.id, cardForm.q, cardForm.a, cardForm.cat); setEditCardOpen(false); } 
    else { await addFlashcard(cardForm.q, cardForm.a, cardForm.cat); setCreateCardOpen(false); }
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (isEditCatOpen) { await updateCategory(catForm.id, catForm.name, catForm.parent || null); setEditCatOpen(false); }
    else { await addCategory(catForm.name, catForm.parent || null); setCreateCatOpen(false); }
    setCatForm({ id: null, name: '', parent: '' });
  };

  const handleBulkDelete = async () => { 
    if (window.confirm(`Permanently delete ${selectedIds.length} cards?`)) { 
      await bulkDeleteFlashcards(selectedIds); 
      setSelectedIds([]); 
      setSelectionMode(false); 
    } 
  };
  
  const toggleSelect = (id) => { 
    if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(i => i !== id)); 
    else setSelectedIds(prev => [...prev, id]); 
  };

  // --- RENDER SIDEBAR ---
  const renderCategoriesSidebar = (parentId = null, depth = 0) => {
    return categories
      .filter(c => getParentId(c) == parentId)
      .map(c => {
        const isGeneral = c.name.toLowerCase() === 'general';
        return (
          <div key={c.id}>
            <div 
              className={`category-item ${selectedCategory == c.id ? 'active' : ''} group`}
              style={{ paddingLeft: `${depth * 12 + 12}px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onClick={() => { setSelectedCategory(c.id); setSidebarOpen(false); setSearchQuery(''); }}
            >
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
              
              <div className="cat-actions" style={{ display: 'flex', gap: '4px' }}>
                <button className="btn-icon-tiny" title="Play Quiz" onClick={(e) => { e.stopPropagation(); startQuiz(c.id); }}>
                  <Play size={12} />
                </button>
                
                {!isGeneral && (
                  <>
                    <button className="btn-icon-tiny" title="Edit" onClick={(e) => { e.stopPropagation(); setCatForm({ id: c.id, name: c.name, parent: getParentId(c) || '' }); setEditCatOpen(true); }}><Edit2 size={12} /></button>
                    <button className="btn-icon-tiny hover-danger" title="Delete" onClick={(e) => { e.stopPropagation(); if(window.confirm(`Delete folder "${c.name}"?`)) deleteCategory(c.id); }}><Trash size={12} /></button>
                  </>
                )}
                {isGeneral && <Lock size={12} style={{opacity: 0.5, marginLeft: 4}}/>}
              </div>
            </div>
            {renderCategoriesSidebar(c.id, depth + 1)}
          </div>
        );
      });
  };

  // --- RENDER GROUPED VIEW ---
  const renderGroupedView = () => {
    const validCatIds = categories.map(c => c.id);
    const orphanCards = filteredCards.filter(f => !validCatIds.includes(parseInt(getCategoryId(f))));
    const catsToRender = categories.filter(cat => filteredCards.some(f => getCategoryId(f) == cat.id));

    return (
      <div style={{ paddingBottom: '4rem' }}>
        {catsToRender.map(cat => {
          const catCards = filteredCards.filter(f => getCategoryId(f) == cat.id);
          return (
            <div key={cat.id} style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: '12px' }}>{catCards.length}</span>
              </div>
              <div className="flashcard-grid">
                {catCards.map(card => (
                  <Flashcard key={card.id} data={card} onEdit={openEditCard} onDelete={(id) => { if(window.confirm('Delete?')) deleteFlashcard(id); }} selectionMode={selectionMode} isSelected={selectedIds.includes(card.id)} onSelect={toggleSelect} />
                ))}
              </div>
            </div>
          );
        })}
        {orphanCards.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
             <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Uncategorized</h3>
             <div className="flashcard-grid">
               {orphanCards.map(card => <Flashcard key={card.id} data={card} onEdit={openEditCard} onDelete={(id) => deleteFlashcard(id)} selectionMode={selectionMode} isSelected={selectedIds.includes(card.id)} onSelect={toggleSelect} />)}
             </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-layout">
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header"><Zap size={24} fill="var(--primary)" /> FlashMind</div>
        
        <div className="category-list">
          <div className={`category-item ${selectedCategory === null ? 'active' : ''}`} onClick={() => {setSelectedCategory(null); setSearchQuery('');}}>All Cards</div>
          
          {/* FOLDERS HEADER WITH CREATE BUTTON */}
          <div style={{
            margin:'1rem 0 0.5rem 0', 
            fontSize:'0.75rem', 
            fontWeight:'600', 
            color:'var(--text-tertiary)', 
            textTransform:'uppercase',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Folders</span>
            <button className="btn-icon-tiny" onClick={openCreateCategory} title="New Folder">
              <Plus size={14}/>
            </button>
          </div>

          {renderCategoriesSidebar()}
        </div>
        
        <div style={{padding: '0.5rem'}}>
          <button className="btn btn-text" style={{width:'100%', justifyContent:'flex-start', color:'var(--text-secondary)'}} onClick={handleExport}>
            <Download size={16}/> Backup Data
          </button>
        </div>

        <div style={{marginTop:'auto', paddingTop:'1rem', borderTop:'1px solid var(--border)'}}>
           <div style={{display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem'}}>
             <div style={{width:32, height:32, borderRadius:'50%', background:'var(--bg-hover)', display:'flex', alignItems:'center', justifyContent:'center'}}><User size={18} /></div>
             <div style={{fontSize:'0.9rem', fontWeight:'500'}}>{user ? 'User Account' : 'Guest'}</div>
           </div>
           <button className="btn btn-outline" style={{width:'100%', justifyContent:'center'}} onClick={logout}><LogOut size={16}/> Sign Out</button>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="main-content">
        <nav className="top-nav">
          <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
            <button className="btn-icon btn-text mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}><Menu size={24}/></button>
            <h2 className="nav-title mobile-hide">
               {categories.find(c => c.id == selectedCategory)?.name || 'All Flashcards'}
            </h2>
          </div>

          <div style={{flex: 1, maxWidth: '400px', margin: '0 1rem', position: 'relative'}}>
            <Search size={16} style={{position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)'}} />
            <input 
              className="input-field" 
              placeholder="Search cards..." 
              style={{marginBottom:0, paddingLeft: '36px', height: '36px', fontSize: '0.9rem'}}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{display:'flex', gap:'0.75rem', alignItems:'center'}}>
            
            {selectionMode ? (
              <div style={{display:'flex', gap:'0.5rem', background:'var(--bg-hover)', padding:'4px', borderRadius:'8px'}}>
                 <button className="btn btn-text btn-icon" onClick={() => { setSelectionMode(false); setSelectedIds([]); }} title="Cancel Selection"><XSquare size={20}/></button>
                 <button className="btn btn-danger btn-icon" onClick={handleBulkDelete} disabled={selectedIds.length === 0} title="Delete Selected">
                    <Trash size={18}/> <span style={{fontSize:'0.85rem', fontWeight:'600', marginLeft:4}}>{selectedIds.length}</span>
                 </button>
              </div>
            ) : (
              <button className="btn btn-text btn-icon" onClick={() => setSelectionMode(true)} title="Bulk Select Mode"><CheckSquare size={20}/></button>
            )}
            
            <div style={{width:1, height:24, background:'var(--border)', margin:'0 4px'}}></div>
            
            <button className="btn btn-outline" onClick={() => startQuiz()} title="Play Quiz">
              <Play size={18} fill="currentColor" /> <span className="mobile-hide">Quiz</span>
            </button>
            
            <button className="btn btn-text btn-icon" onClick={toggleTheme}>{theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}</button>
            <button className="btn btn-outline" onClick={openCreateCategory}><Layers size={18}/> <span className="mobile-hide">Folder</span></button>
            <button className="btn btn-primary" onClick={openCreateCard}><Plus size={18}/> <span className="mobile-hide">New Card</span></button>
          </div>
        </nav>

        <div className="content-area">
          {selectedCategory === null || searchQuery ? (
            filteredCards.length === 0 ? (
               <div style={{textAlign:'center', padding:'4rem 0', color:'var(--text-tertiary)'}}><p>No cards found.</p></div>
            ) : (
               renderGroupedView()
            )
          ) : (
            <div className="flashcard-grid">
              {filteredCards.length === 0 ? <p>No cards in this folder.</p> : 
                 filteredCards.map(card => <Flashcard key={card.id} data={card} onEdit={openEditCard} onDelete={(id) => deleteFlashcard(id)} selectionMode={selectionMode} isSelected={selectedIds.includes(card.id)} onSelect={toggleSelect} />)
              }
            </div>
          )}
        </div>
      </main>

      {/* ---------------- QUIZ OVERLAY ---------------- */}
      {quizMode && (
        <div style={{
          position: 'fixed', inset: 0, background: 'var(--bg-app)', zIndex: 200, 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          {/* Progress Bar */}
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'var(--border)'}}>
            <div style={{
              height: '100%', 
              width: `${((quizIndex + (showScore ? 1 : 0)) / quizCards.length) * 100}%`, 
              background: 'var(--primary)', 
              transition: 'width 0.3s ease'
            }}/>
          </div>

          <div style={{position: 'absolute', top: 20, right: 20}}>
            <button className="btn btn-outline" onClick={() => setQuizMode(false)}><X size={24}/></button>
          </div>

          {showScore ? (
            <div style={{textAlign: 'center', animation: 'scaleIn 0.3s'}}>
              <h1 style={{fontSize: '4rem', margin: 0, color: 'var(--primary)'}}>{score} <span style={{fontSize:'2rem', color:'var(--text-tertiary)'}}>/ {quizCards.length}</span></h1>
              <p style={{color: 'var(--text-secondary)', fontSize:'1.2rem'}}>Final Score</p>
              <div style={{display:'flex', gap:'1rem', justifyContent:'center', marginTop:'2rem'}}>
                <button className="btn btn-outline" onClick={() => setQuizMode(false)}>Exit</button>
                <button className="btn btn-primary" onClick={() => startQuiz()}>Replay</button>
              </div>
            </div>
          ) : (
            <div style={{width: '100%', maxWidth: '500px', padding: '1rem'}}>
              <div style={{marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-tertiary)', fontWeight: 600}}>
                <span>Question {quizIndex + 1} / {quizCards.length}</span>
                <span>Score: {score}</span>
              </div>
              
              <div style={{height: '300px', perspective: '1000px'}}>
                 <Flashcard key={quizCards[quizIndex].id} data={quizCards[quizIndex]} readOnly={true} />
              </div>

              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center'}}>
                 <button className="btn btn-danger" style={{width: '120px'}} onClick={() => handleQuizAnswer(false)}>Missed</button>
                 <button className="btn btn-primary" style={{backgroundColor: '#10b981', width: '120px', border:'none'}} onClick={() => handleQuizAnswer(true)}>Got it</button>
              </div>
              <p style={{textAlign:'center', marginTop:'1.5rem', color:'var(--text-tertiary)', fontSize:'0.9rem'}}>
                (Click the card to reveal the answer)
              </p>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODALS ---------------- */}
      <Modal isOpen={isCreateCardOpen || isEditCardOpen} onClose={() => { setCreateCardOpen(false); setEditCardOpen(false); }} title={isEditCardOpen ? "Edit Flashcard" : "New Flashcard"}>
        <form onSubmit={handleCardSubmit}>
            <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem'}}>Question</label>
            <input className="input-field" value={cardForm.q} onChange={e=>setCardForm({...cardForm, q: e.target.value})} required />
            <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem'}}>Answer (Markdown supported)</label>
            <textarea className="input-field" rows="4" value={cardForm.a} onChange={e=>setCardForm({...cardForm, a: e.target.value})} required placeholder="**Bold** text, - lists, or `code`" />
            <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem'}}>Folder</label>
            <select className="input-field" value={cardForm.cat} onChange={e=>setCardForm({...cardForm, cat: e.target.value})} required>
                <option value="">Select Folder</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{display:'flex', justifyContent:'flex-end', gap:'1rem', marginTop:'1rem'}}>
              <button type="button" className="btn btn-text" onClick={() => { setCreateCardOpen(false); setEditCardOpen(false); }}>Cancel</button>
              <button className="btn btn-primary">{isEditCardOpen ? "Save" : "Create"}</button>
            </div>
        </form>
      </Modal>

      <Modal isOpen={isCreateCatOpen || isEditCatOpen} onClose={() => { setCreateCatOpen(false); setEditCatOpen(false); }} title={isEditCatOpen ? "Edit Folder" : "New Folder"}>
         <form onSubmit={handleCatSubmit}>
            <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem'}}>Folder Name</label>
            <input className="input-field" value={catForm.name} onChange={e=>setCatForm({...catForm, name: e.target.value})} required />
            <label style={{display:'block', marginBottom:'0.5rem', fontSize:'0.85rem'}}>Parent Folder</label>
            <select className="input-field" value={catForm.parent} onChange={e=>setCatForm({...catForm, parent: e.target.value})}>
                <option value="">No Parent (Root)</option>
                {categories.filter(c => c.id !== catForm.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{display:'flex', justifyContent:'flex-end', gap:'1rem', marginTop:'1rem'}}>
              <button type="button" className="btn btn-text" onClick={() => { setCreateCatOpen(false); setEditCatOpen(false); }}>Cancel</button>
              <button className="btn btn-primary">{isEditCatOpen ? "Save Changes" : "Create Folder"}</button>
            </div>
         </form>
      </Modal>
    </div>
  );
};

export default Dashboard;