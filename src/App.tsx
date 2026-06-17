import { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { MapScreen } from './components/MapScreen';
import { BudgetScreen } from './components/BudgetScreen';
import { TimelineScreen } from './components/TimelineScreen';
import { ChecklistScreen } from './components/ChecklistScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { Compass, Map, DollarSign, Image, ClipboardList, LogOut } from 'lucide-react';
import { supabase } from './utils/supabaseClient';
import { MasaLogo } from './components/MasaLogo';



// Types
interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface TimelineEntry {
  id: string;
  imageUrl: string;
  note: string;
  date: string;
  location: Location;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ChecklistItem {
  id: string;
  name: string;
  completed: boolean;
}

interface User {
  name: string;
  email: string;
  photoURL: string;
}

function App() {
  // Check if Supabase env credentials exist and are not placeholders
  const [isSupabaseConfigured] = useState(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return !!(url && key && !url.includes('your-supabase-project-id'));
  });

  // Active session state from Supabase
  const [session, setSession] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const handleDbError = (err: any) => {
    if (err && err.code === '42P01') {
      setDbError("טבלאות מסד הנתונים לא קיימות ב-Supabase. אנא העתק והרץ את קוד ה-SQL בתוך ה-SQL Editor של Supabase שלך (הסבר מופיע בצ'אט).");
    } else if (err) {
      console.error('Database query error:', err);
    }
  };


  // Authentication State
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('travel_user');
    return saved ? JSON.parse(saved) : null;
  });

  // App Navigation State
  const [currentScreen, setCurrentScreen] = useState<'map' | 'budget' | 'timeline' | 'checklist' | 'settings'>(() => {
    const hash = window.location.hash.replace('#', '');
    const validScreens = ['map', 'budget', 'timeline', 'checklist', 'settings'];
    return (validScreens.includes(hash) ? hash : 'map') as any;
  });
  const [highlightedEntryId, setHighlightedEntryId] = useState<string | null>(null);

  const handleNavigateToTimeline = (entryId: string) => {
    setHighlightedEntryId(entryId);
    setCurrentScreen('timeline');
    // Clear highlight after 4 seconds
    setTimeout(() => {
      setHighlightedEntryId(null);
    }, 4000);
  };

  // Map Tile Style State
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'osm' | 'satellite'>(() => {
    const saved = localStorage.getItem('travel_map_style');
    return (saved as 'dark' | 'light' | 'osm' | 'satellite') || 'dark';
  });

  // App Data States (Empty Slates for purely Manual entry)
  const [budgetLimit, setBudgetLimit] = useState<number>(() => {
    const saved = localStorage.getItem('travel_budget_limit');
    return saved ? parseFloat(saved) : 5000;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('travel_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>(() => {
    const saved = localStorage.getItem('travel_timeline');
    return saved ? JSON.parse(saved) : [];
  });

  const [packingItems, setPackingItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('travel_packing');
    return saved ? JSON.parse(saved) : [];
  });

  const [placesItems, setPlacesItems] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('travel_places');
    return saved ? JSON.parse(saved) : [];
  });

  // Clean up any old broken entries that use temporary blob URLs
  useEffect(() => {
    setTimelineEntries(prev => {
      const filtered = prev.filter(entry => !entry.imageUrl.startsWith('blob:'));
      if (filtered.length !== prev.length) {
        console.log("Cleaned up broken blob URL entries");
      }
      return filtered;
    });
  }, []);

  // Synchronize currentScreen to URL hash
  useEffect(() => {
    if (user) {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash !== currentScreen) {
        window.location.hash = currentScreen;
      }
    }
  }, [currentScreen, user]);

  // Listen for hash changes to navigate back/forth
  useEffect(() => {
    const handleHashChange = () => {
      if (!user) return;
      const hash = window.location.hash.replace('#', '');
      const validScreens = ['map', 'budget', 'timeline', 'checklist', 'settings'];
      if (validScreens.includes(hash)) {
        setCurrentScreen(hash as any);
      } else {
        const currentHash = window.location.hash.replace('#', '');
        if (currentHash !== currentScreen) {
          window.location.hash = currentScreen;
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [user, currentScreen]);

  // Listen to Supabase Auth Changes
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsAuthLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'משתמש גוגל',
          email: session.user.email || '',
          photoURL: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email || '')}&background=9d4edd&color=fff&size=150`
        });
      }
      setIsAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'משתמש גוגל',
          email: session.user.email || '',
          photoURL: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email || '')}&background=9d4edd&color=fff&size=150`
        });
      } else {
        // If logged out from Supabase, only clear user if they weren't logged in manually
        setUser(current => {
          const isManual = localStorage.getItem('travel_user_is_manual') === 'true';
          return isManual ? current : null;
        });
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isSupabaseConfigured]);

  // Load user data from Supabase once logged in
  useEffect(() => {
    if (!session?.user) {
      return;
    }

    const loadSupabaseData = async () => {
      setIsDataLoading(true);
      setDbError(null);
      try {
        const userId = session.user.id;

        // 1. Fetch Profile (Budget Limit, name, avatar)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('budget_limit, full_name, avatar_url')
          .eq('id', userId)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profile doesn't exist yet, insert a default one with google metadata
            try {
              const { error: insError } = await supabase.from('profiles').insert({ 
                id: userId, 
                budget_limit: 5000,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                avatar_url: session.user.user_metadata?.avatar_url
              });
              if (insError) handleDbError(insError);
              else setBudgetLimit(5000);
            } catch (err) {
              console.error(err);
            }
          } else {
            handleDbError(profileError);
          }
        } else if (profileData) {
          setBudgetLimit(Number(profileData.budget_limit));
          if (profileData.full_name || profileData.avatar_url) {
            setUser(prev => {
              if (!prev) return null;
              return {
                ...prev,
                name: profileData.full_name || prev.name,
                photoURL: profileData.avatar_url || prev.photoURL
              };
            });
          }
        }


        // 2. Fetch Timeline Entries
        const { data: timelineData, error: timelineError } = await supabase
          .from('timeline')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (timelineError) {
          handleDbError(timelineError);
        } else if (timelineData) {
          const mappedTimeline: TimelineEntry[] = timelineData.map(item => ({
            id: item.id,
            imageUrl: item.image_url,
            note: item.note || '',
            date: item.date,
            location: {
              lat: item.lat,
              lng: item.lng,
              name: item.location_name
            }
          }));
          setTimelineEntries(mappedTimeline);
        }

        // 3. Fetch Expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (expensesError) {
          handleDbError(expensesError);
        } else if (expensesData) {
          const mappedExpenses: Expense[] = expensesData.map(item => ({
            id: item.id,
            amount: Number(item.amount),
            category: item.category,
            description: item.description || '',
            date: item.date
          }));
          setExpenses(mappedExpenses);
        }

        // 4. Fetch Checklist
        const { data: checklistData, error: checklistError } = await supabase
          .from('checklist')
          .select('*')
          .eq('user_id', userId);

        if (checklistError) {
          handleDbError(checklistError);
        } else if (checklistData) {
          const packing: ChecklistItem[] = [];
          const places: ChecklistItem[] = [];
          
          checklistData.forEach(item => {
            const mappedItem: ChecklistItem = {
              id: item.id,
              name: item.name,
              completed: item.completed
            };
            if (item.type === 'packing') {
              packing.push(mappedItem);
            } else {
              places.push(mappedItem);
            }
          });

          setPackingItems(packing);
          setPlacesItems(places);
        }

      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadSupabaseData();
  }, [session]);

  // Save states to LocalStorage (only if user logged in manually)
  useEffect(() => {
    if (user) {
      localStorage.setItem('travel_user', JSON.stringify(user));
      localStorage.setItem('travel_saved_profile', JSON.stringify(user));
    } else {
      localStorage.removeItem('travel_user');
      localStorage.removeItem('travel_user_is_manual');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('travel_map_style', mapStyle);
  }, [mapStyle]);

  useEffect(() => {
    if (!session?.user && user) {
      localStorage.setItem('travel_budget_limit', budgetLimit.toString());
    }
  }, [budgetLimit, session, user]);

  useEffect(() => {
    if (!session?.user && user) {
      localStorage.setItem('travel_expenses', JSON.stringify(expenses));
    }
  }, [expenses, session, user]);

  useEffect(() => {
    if (!session?.user && user) {
      try {
        localStorage.setItem('travel_timeline', JSON.stringify(timelineEntries));
      } catch (error) {
        console.error("LocalStorage write failed:", error);
      }
    }
  }, [timelineEntries, session, user]);

  useEffect(() => {
    if (!session?.user && user) {
      localStorage.setItem('travel_packing', JSON.stringify(packingItems));
    }
  }, [packingItems, session, user]);

  useEffect(() => {
    if (!session?.user && user) {
      localStorage.setItem('travel_places', JSON.stringify(placesItems));
    }
  }, [placesItems, session, user]);


  // Auth Handlers
  const handleLogin = (newUser: User) => {
    localStorage.setItem('travel_user_is_manual', 'true');
    setUser(newUser);

    const savedLimit = localStorage.getItem('travel_budget_limit');
    setBudgetLimit(savedLimit ? parseFloat(savedLimit) : 5000);

    const savedExpenses = localStorage.getItem('travel_expenses');
    setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);

    const savedTimeline = localStorage.getItem('travel_timeline');
    setTimelineEntries(savedTimeline ? JSON.parse(savedTimeline) : []);

    const savedPacking = localStorage.getItem('travel_packing');
    setPackingItems(savedPacking ? JSON.parse(savedPacking) : []);

    const savedPlaces = localStorage.getItem('travel_places');
    setPlacesItems(savedPlaces ? JSON.parse(savedPlaces) : []);
  };

  const handleLogout = async () => {
    setUser(null);
    setSession(null);
    setExpenses([]);
    setTimelineEntries([]);
    setPackingItems([]);
    setPlacesItems([]);
    setBudgetLimit(5000);
    window.location.hash = '';
    localStorage.removeItem('travel_user');
    localStorage.removeItem('travel_user_is_manual');
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    if (session?.user) {
      try {
        // 1. Update profiles table
        const { error: dbError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            full_name: updatedUser.name,
            avatar_url: updatedUser.photoURL
          });
        if (dbError) {
          handleDbError(dbError);
        }

        // 2. Also update Auth metadata just in case
        await supabase.auth.updateUser({
          data: {
            full_name: updatedUser.name,
            avatar_url: updatedUser.photoURL
          }
        });
      } catch (err) {
        console.error('Error updating profile metadata:', err);
      }
    }
  };



  // Timeline handlers
  const handleAddTimelineEntry = async (entry: Omit<TimelineEntry, 'id'>) => {
    const tempId = `timeline-${Date.now()}`;
    const newEntryLocal: TimelineEntry = {
      ...entry,
      id: tempId
    };
    setTimelineEntries(prev => [...prev, newEntryLocal]);

    if (session?.user) {
      try {
        const { data, error } = await supabase
          .from('timeline')
          .insert({
            user_id: session.user.id,
            image_url: entry.imageUrl,
            note: entry.note,
            date: entry.date,
            lat: entry.location.lat,
            lng: entry.location.lng,
            location_name: entry.location.name
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving timeline entry to Supabase:', error);
        } else if (data) {
          setTimelineEntries(prev =>
            prev.map(item =>
              item.id === tempId
                ? {
                    id: data.id,
                    imageUrl: data.image_url,
                    note: data.note || '',
                    date: data.date,
                    location: {
                      lat: data.lat,
                      lng: data.lng,
                      name: data.location_name
                    }
                  }
                : item
            )
          );
        }
      } catch (err) {
        console.error('Failed to sync new timeline entry:', err);
      }
    }
  };

  const handleUpdateTimelineNote = async (id: string, note: string) => {
    setTimelineEntries(prev =>
      prev.map(entry => (entry.id === id ? { ...entry, note } : entry))
    );

    if (session?.user) {
      try {
        const { error } = await supabase
          .from('timeline')
          .update({ note })
          .eq('id', id);

        if (error) {
          console.error('Error updating timeline note in Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to sync timeline note update:', err);
      }
    }
  };

  const handleDeleteTimelineEntry = async (id: string) => {
    setTimelineEntries(prev => prev.filter(entry => entry.id !== id));

    if (session?.user) {
      try {
        const { error } = await supabase
          .from('timeline')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting timeline entry from Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to sync timeline entry deletion:', err);
      }
    }
  };

  // Expense handlers
  const handleAddExpense = async (exp: Omit<Expense, 'id'>) => {
    const tempId = `expense-${Date.now()}`;
    const newExpenseLocal: Expense = {
      ...exp,
      id: tempId
    };
    setExpenses(prev => [newExpenseLocal, ...prev]);

    if (session?.user) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .insert({
            user_id: session.user.id,
            amount: exp.amount,
            category: exp.category,
            description: exp.description,
            date: exp.date
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving expense to Supabase:', error);
        } else if (data) {
          setExpenses(prev =>
            prev.map(item =>
              item.id === tempId
                ? {
                    id: data.id,
                    amount: Number(data.amount),
                    category: data.category,
                    description: data.description || '',
                    date: data.date
                  }
                : item
            )
          );
        }
      } catch (err) {
        console.error('Failed to sync new expense:', err);
      }
    }
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));

    if (session?.user) {
      try {
        const { error } = await supabase
          .from('expenses')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting expense from Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to sync expense deletion:', err);
      }
    }
  };

  // Checklist handlers
  const handleAddChecklistItem = async (type: 'packing' | 'places', name: string) => {
    const tempId = `item-${Date.now()}`;
    const newItemLocal: ChecklistItem = {
      id: tempId,
      name,
      completed: false
    };

    if (type === 'packing') {
      setPackingItems(prev => [...prev, newItemLocal]);
    } else {
      setPlacesItems(prev => [...prev, newItemLocal]);
    }

    if (session?.user) {
      try {
        const { data, error } = await supabase
          .from('checklist')
          .insert({
            user_id: session.user.id,
            name,
            completed: false,
            type
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving checklist item to Supabase:', error);
        } else if (data) {
          const mapper = (item: ChecklistItem) =>
            item.id === tempId
              ? {
                  id: data.id,
                  name: data.name,
                  completed: data.completed
                }
              : item;

          if (type === 'packing') {
            setPackingItems(prev => prev.map(mapper));
          } else {
            setPlacesItems(prev => prev.map(mapper));
          }
        }
      } catch (err) {
        console.error('Failed to sync new checklist item:', err);
      }
    }
  };

  const handleToggleChecklistItem = async (type: 'packing' | 'places', id: string) => {
    const list = type === 'packing' ? packingItems : placesItems;
    const targetItem = list.find(item => item.id === id);
    if (!targetItem) return;

    const newCompleted = !targetItem.completed;

    const mapper = (item: ChecklistItem) =>
      item.id === id ? { ...item, completed: newCompleted } : item;

    if (type === 'packing') {
      setPackingItems(prev => prev.map(mapper));
    } else {
      setPlacesItems(prev => prev.map(mapper));
    }

    if (session?.user) {
      try {
        const { error } = await supabase
          .from('checklist')
          .update({ completed: newCompleted })
          .eq('id', id);

        if (error) {
          console.error('Error updating checklist item state in Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to sync checklist item toggle:', err);
      }
    }
  };

  const handleDeleteChecklistItem = async (type: 'packing' | 'places', id: string) => {
    if (type === 'packing') {
      setPackingItems(prev => prev.filter(i => i.id !== id));
    } else {
      setPlacesItems(prev => prev.filter(i => i.id !== id));
    }

    if (session?.user) {
      try {
        const { error } = await supabase
          .from('checklist')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting checklist item from Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to sync checklist item deletion:', err);
      }
    }
  };

  const handleClearAllData = async () => {
    localStorage.clear();
    setUser(null);
    setExpenses([]);
    setTimelineEntries([]);
    setPackingItems([]);
    setPlacesItems([]);
    setBudgetLimit(5000);
    if (session?.user) {
      try {
        const userId = session.user.id;
        await supabase.from('profiles').delete().eq('id', userId);
        await supabase.from('timeline').delete().eq('user_id', userId);
        await supabase.from('expenses').delete().eq('user_id', userId);
        await supabase.from('checklist').delete().eq('user_id', userId);
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Failed to clear database data:', err);
      }
    }
  };

  if (isAuthLoading || isDataLoading) {
    return (
      <div className="auth-screen" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="auth-logo-glow" style={{ animation: 'float 3s ease-in-out infinite' }}>
          <Compass className="auth-logo-icon animate-spin" style={{ width: '48px', height: '48px', color: '#9d4edd' }} />
        </div>
        <p style={{ color: '#fff', fontSize: '18px', fontWeight: 500, direction: 'rtl' }}>טוען נתונים מהענן...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {dbError && (
        <div style={{
          backgroundColor: '#ff4d4d',
          color: '#fff',
          padding: '12px 24px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '14px',
          direction: 'rtl',
          zIndex: 1001,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <span>⚠️ {dbError}</span>
          <button 
            onClick={() => setDbError(null)}
            style={{
              background: 'rgba(255,255,255,0.3)',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              padding: '2px 8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'inherit'
            }}
          >
            סגור
          </button>
        </div>
      )}
      
      {/* Top Navbar Navigation */}
      <header className="top-navbar">
        {/* Right side: Logo */}
        <div className="navbar-logo-container" onClick={() => setCurrentScreen('map')}>
          <MasaLogo className="navbar-logo-icon" size={28} />
          <span className="navbar-logo-text">MASA</span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="navbar-nav">
          <button
            className={`navbar-nav-item ${currentScreen === 'map' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('map')}
          >
            <Map className="nav-icon" size={18} />
            <span>מפה</span>
          </button>

          <button
            className={`navbar-nav-item ${currentScreen === 'budget' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('budget')}
          >
            <DollarSign className="nav-icon" size={18} />
            <span>תקציב</span>
          </button>

          <button
            className={`navbar-nav-item ${currentScreen === 'timeline' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('timeline')}
          >
            <Image className="nav-icon" size={18} />
            <span>יומן מסע</span>
          </button>

          <button
            className={`navbar-nav-item ${currentScreen === 'checklist' ? 'active' : ''}`}
            onClick={() => setCurrentScreen('checklist')}
          >
            <ClipboardList className="nav-icon" size={18} />
            <span>רשימות תכנון</span>
          </button>
        </nav>

        {/* Left side: User profile & Logout */}
        <div className="navbar-user-section">
          <button className="btn-logout-navbar" onClick={handleLogout}>
            <LogOut size={14} />
            <span>התנתק</span>
          </button>
          <img
            src={user.photoURL}
            className={`navbar-user-avatar ${currentScreen === 'settings' ? 'active' : ''}`}
            alt="Avatar"
            onClick={() => setCurrentScreen('settings')}
          />
        </div>
      </header>

      {/* Main Content Canvas (Left side) */}
      <main className="main-content no-padding">
        {/* Map is always rendered in the background */}
        <div className="map-wrapper-layer">
          <MapScreen
            timelineEntries={timelineEntries}
            mapStyle={mapStyle}
            onAddEntry={handleAddTimelineEntry}
            onNavigateToTimeline={handleNavigateToTimeline}
          />
        </div>

        {/* Glass screen overlay for other tabs */}
        {currentScreen !== 'map' && (
          <div className="glass-screen-overlay">
            {currentScreen === 'budget' && (
              <BudgetScreen
                expenses={expenses}
                budgetLimit={budgetLimit}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
                onUpdateBudgetLimit={async (limit) => {
                  setBudgetLimit(limit);
                  if (session?.user) {
                    try {
                      await supabase
                        .from('profiles')
                        .upsert({ id: session.user.id, budget_limit: limit });
                    } catch (err) {
                      console.error('Failed to update budget limit in profiles:', err);
                    }
                  }
                }}
              />
            )}

            {currentScreen === 'timeline' && (
              <TimelineScreen
                entries={timelineEntries}
                onUpdateNote={handleUpdateTimelineNote}
                onDeleteEntry={handleDeleteTimelineEntry}
                highlightedEntryId={highlightedEntryId}
              />
            )}

            {currentScreen === 'checklist' && (
              <ChecklistScreen
                packingItems={packingItems}
                placesItems={placesItems}
                onAddItem={handleAddChecklistItem}
                onToggleItem={handleToggleChecklistItem}
                onDeleteItem={handleDeleteChecklistItem}
              />
            )}

            {currentScreen === 'settings' && (
              <SettingsScreen
                user={user}
                mapStyle={mapStyle}
                onUpdateUser={handleUpdateUser}
                onUpdateMapStyle={setMapStyle}
                onClearAllData={handleClearAllData}
              />
            )}
          </div>
        )}
      </main>


    </div>
  );
}

export default App;
