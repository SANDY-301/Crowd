import React, { useState, useMemo, memo, useEffect } from 'react';
import { View, TextInput, StyleSheet, FlatList, Text, TouchableOpacity, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SearchBar = memo(({ data, onSelect }) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      // 1. Local Mock Data Matches
      const localMatches = data
        .filter(v => v.name.toLowerCase().includes(query.toLowerCase()))
        .map(v => ({ id: v.id, name: v.name, venue: v, type: 'local', icon: 'location' }));
      
      setIsSearching(true);
      try {
        // 2. Global OpenStreetMap Matches (100% Free API)
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=4`);
        const json = await res.json();
        
        const globalMatches = json.map(item => ({
          id: item.place_id.toString(),
          name: item.display_name,
          type: 'global',
          icon: 'earth-outline',
          coordinate: { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) }
        }));
        
        // Merge and remove duplicates (by name roughly)
        setResults([...localMatches, ...globalMatches]);
      } catch (e) {
        // Fallback if API fails (offline)
        setResults(localMatches);
      } finally {
        setIsSearching(false);
      }
    }, 800); // 800ms debounce to respect OpenStreetMap rate limits (1 req/sec)

    return () => clearTimeout(timeoutId);
  }, [query, data]);

  const handleSelect = (item) => {
    Keyboard.dismiss();
    setQuery('');
    setIsFocused(false);
    
    if (item.type === 'local') {
      onSelect(item.venue); // Opens bottom sheet
    } else {
      onSelect({ coordinate: item.coordinate, isGlobal: true }); // Just pans the map
    }
  };

  return (
    <View style={[styles.wrapper, { top: Math.max(insets.top, 10) + 85 }]} pointerEvents="box-none">
      <View style={styles.container}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Search locations..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        )}
      </View>

      {isFocused && (results.length > 0 || isSearching) && (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>Searching globally...</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={item => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                  <Ionicons name={item.icon} size={16} color={item.type === 'local' ? '#6366F1' : 'rgba(255,255,255,0.6)'} style={{ marginRight: 8 }} />
                  <Text style={styles.resultText} numberOfLines={2}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </View>
  );
});

export default SearchBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15,15,30,0.9)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  resultsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(15,15,30,0.95)',
    borderRadius: 16,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  resultText: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
