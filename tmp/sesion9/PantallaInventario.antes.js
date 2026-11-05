import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, Alert, ScrollView, Platform, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@inventario_equipos_web';

const EQUIPOS_INICIALES = [
  { id: '1', codigo: 'INV-0001', nombre: 'PC Escritorio 01', ubicacion: 'Oficina Admin', estado: 'Operativo' },
  { id: '2', codigo: 'INV-0002', nombre: 'Laptop Dell 14"', ubicacion: 'Soporte Técnico', estado: 'En reparación' },
  { id: '3', codigo: 'INV-0003', nombre: 'Impresora HP LaserJet', ubicacion: 'Recepción', estado: 'Operativo' },
  { id: '4', codigo: 'INV-0004', nombre: 'PC Escritorio 02', ubicacion: 'Bodega', estado: 'Dado de baja' },
];

export function PantallaInventario() {
  const [equipos, setEquipos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [idEditando, setIdEditando] = useState(null);

  
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null);
  const nombreRef = useRef(null);
  const ubicacionRef = useRef(null);
  const timerAviso = useRef(null);

  const { width } = useWindowDimensions();
  const numColumns = width >= 1024 ? 3 : width >= 768 ? 2 : 1;

  useEffect(() => {
    cargarDatosLocales();
    return () => clearTimeout(timerAviso.current);
  }, []);

  
  const mostrarAviso = (tipo, texto) => {
    clearTimeout(timerAviso.current);
    setAviso({ tipo, texto });
    timerAviso.current = setTimeout(() => setAviso(null), 4000);
  };

  const cargarDatosLocales = async () => {
    try {
      if (Platform.OS === 'web') {
        const guardadoWeb = window.localStorage.getItem(STORAGE_KEY);
        if (guardadoWeb) {
          setEquipos(JSON.parse(guardadoWeb));
          return;
        }
      }

      const guardados = await AsyncStorage.getItem(STORAGE_KEY);
      if (guardados !== null) {
        setEquipos(JSON.parse(guardados));
      } else {
        setEquipos(EQUIPOS_INICIALES);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(EQUIPOS_INICIALES));
        if (Platform.OS === 'web') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(EQUIPOS_INICIALES));
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const guardarEnStorage = async (nuevaLista) => {
    try {
      setEquipos(nuevaLista);
      const jsonValue = JSON.stringify(nuevaLista);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      if (Platform.OS === 'web') {
        window.localStorage.setItem(STORAGE_KEY, jsonValue);
      }
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  };

  
  const validarFormulario = () => {
    const nuevosErrores = {};
    if (!nombre.trim()) nuevosErrores.nombre = 'Escribe el nombre del equipo.';
    if (!ubicacion.trim()) nuevosErrores.ubicacion = 'Escribe la ubicación del equipo.';
    setErrores(nuevosErrores);

    if (nuevosErrores.nombre) {
      nombreRef.current?.focus();
    } else if (nuevosErrores.ubicacion) {
      ubicacionRef.current?.focus();
    }
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarOActualizarEquipo = () => {
    if (!validarFormulario()) {
      mostrarAviso('error', 'Revisa los campos marcados en rojo.');
      return;
    }

    if (idEditando !== null) {
      const nuevaLista = equipos.map((item) => {
        if (String(item.id) === String(idEditando)) {
          return { ...item, nombre: nombre.trim(), ubicacion: ubicacion.trim() };
        }
        return item;
      });
      guardarEnStorage(nuevaLista);
      setIdEditando(null);
      mostrarAviso('ok', 'Equipo actualizado correctamente.');
    } else {
      const nuevo = {
        id: String(Date.now()),
        codigo: `INV-${String(equipos.length + 1).padStart(4, '0')}`,
        nombre: nombre.trim(),
        ubicacion: ubicacion.trim(),
        estado: 'Operativo',
      };
      const nuevaLista = [nuevo, ...equipos];
      guardarEnStorage(nuevaLista);
      mostrarAviso('ok', `Equipo ${nuevo.codigo} guardado.`);
      
      setTimeout(() => nombreRef.current?.focus(), 0);
    }

    setNombre('');
    setUbicacion('');
    setErrores({});
  };

  const iniciarEdicion = (item) => {
    setNombre(item.nombre);
    setUbicacion(item.ubicacion);
    setIdEditando(item.id);
    setErrores({});
  };

  const cancelarEdicion = () => {
    setNombre('');
    setUbicacion('');
    setIdEditando(null);
    setErrores({});
  };

  const eliminarEquipo = (idTarget) => {
    const nuevaLista = equipos.filter((item) => String(item.id) !== String(idTarget));
    guardarEnStorage(nuevaLista);
    if (String(idEditando) === String(idTarget)) {
      cancelarEdicion();
    }
  };

  const equiposFiltrados = filtro === 'Todos'
    ? equipos
    : equipos.filter(item => item.estado === filtro);

 
  const encabezado = (
    <View>
      {/* FORMULARIO */}
      <View style={[styles.formCard, idEditando !== null && styles.formCardEditing]}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>
            {idEditando !== null ? ' Modo Edición: Modificar Equipo' : ' Registrar Nuevo Equipo'}
          </Text>
          {idEditando !== null && (
            <Pressable
              onPress={cancelarEdicion}
              accessibilityRole="button"
              accessibilityLabel="Cancelar edición"
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          )}
        </View>

        
        {aviso !== null && (
          <View
            style={[styles.aviso, aviso.tipo === 'ok' ? styles.avisoOk : styles.avisoError]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Text style={[styles.avisoText, aviso.tipo === 'ok' ? styles.avisoTextOk : styles.avisoTextError]}>
              {aviso.texto}
            </Text>
          </View>
        )}

        <TextInput
          ref={nombreRef}
          style={[styles.input, errores.nombre && styles.inputError]}
          placeholder="Nombre del equipo (Ej. Portátil HP ProBook)"
          placeholderTextColor="#94A3B8"
          value={nombre}
          onChangeText={(texto) => {
            setNombre(texto);
            if (errores.nombre) setErrores((e) => ({ ...e, nombre: undefined }));
          }}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => ubicacionRef.current?.focus()}
          accessibilityLabel="Nombre del equipo"
        />
        {errores.nombre ? <Text style={styles.errorText}>{errores.nombre}</Text> : null}

        <TextInput
          ref={ubicacionRef}
          style={[styles.input, errores.ubicacion && styles.inputError]}
          placeholder="Ubicación (Ej. Laboratorio de Sistemas)"
          placeholderTextColor="#94A3B8"
          value={ubicacion}
          onChangeText={(texto) => {
            setUbicacion(texto);
            if (errores.ubicacion) setErrores((e) => ({ ...e, ubicacion: undefined }));
          }}
          returnKeyType="done"
          onSubmitEditing={guardarOActualizarEquipo}
          accessibilityLabel="Ubicación del equipo"
        />
        {errores.ubicacion ? <Text style={styles.errorText}>{errores.ubicacion}</Text> : null}

        <Pressable
          style={[styles.btnPrimary, idEditando !== null && styles.btnWarning]}
          onPress={guardarOActualizarEquipo}
          accessibilityRole="button"
          accessibilityLabel={idEditando !== null ? "Actualizar registro de equipo" : "Guardar equipo"}
        >
          <Text style={styles.btnPrimaryText}>
            {idEditando !== null ? 'Actualizar Registro' : 'Guardar Localmente'}
          </Text>
        </Pressable>
      </View>

      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsContainer}
        keyboardShouldPersistTaps="handled"
      >
        {['Todos', 'Operativo', 'En reparación', 'Dado de baja'].map((cat) => (
          <Pressable
            key={cat}
            style={[styles.chip, filtro === cat && styles.chipSelected]}
            onPress={() => setFiltro(cat)}
            accessibilityRole="button"
          >
            <Text style={[styles.chipText, filtro === cat && styles.chipTextSelected]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      
      <FlatList
        key={numColumns}
        data={equiposFiltrados}
        numColumns={numColumns}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.scrollContainer}
        columnWrapperStyle={numColumns > 1 ? styles.rowWrapper : undefined}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={encabezado}
        renderItem={({ item }) => {
          const colorEstado =
            item.estado === 'Operativo' ? '#059669' :
            item.estado === 'En reparación' ? '#D97706' : '#DC2626';

          const bgBadge =
            item.estado === 'Operativo' ? '#ECFDF5' :
            item.estado === 'En reparación' ? '#FFFBEB' : '#FEF2F2';

          return (
            <View style={[styles.itemCard, { width: numColumns === 3 ? '32.3%' : numColumns === 2 ? '48.5%' : '100%' }]}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemCode}>{item.codigo}</Text>
                <View style={[styles.badge, { backgroundColor: bgBadge }]}>
                  <Text style={[styles.badgeText, { color: colorEstado }]}>{item.estado}</Text>
                </View>
              </View>

              <Text style={styles.itemName}>{item.nombre}</Text>
              <Text style={styles.itemLocation}>📍 {item.ubicacion}</Text>

              <View style={styles.itemActions}>
                <Pressable
                  style={styles.btnEdit}
                  onPress={() => iniciarEdicion(item)}
                  accessibilityRole="button"
                >
                  <Text style={styles.btnEditText}>Editar</Text>
                </Pressable>
                <Pressable
                  style={styles.btnDelete}
                  onPress={() => eliminarEquipo(item.id)}
                  accessibilityRole="button"
                >
                  <Text style={styles.btnDeleteText}>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay registros de equipos disponibles.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { padding: 12, paddingBottom: 30, maxWidth: 1400, alignSelf: 'center', width: '100%' },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  formCardEditing: {
    borderColor: '#2563EB',
    borderWidth: 1.5,
    backgroundColor: '#EFF6FF',
  },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  formTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  cancelText: { fontSize: 12, fontWeight: '600', color: '#EF4444' },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#334155',
    marginBottom: 10,
  },
  
  inputError: { borderColor: '#DC2626', borderWidth: 1.5, marginBottom: 4 },
  errorText: { color: '#DC2626', fontSize: 12, fontWeight: '600', marginBottom: 10 },
  aviso: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10, borderWidth: 1 },
  avisoOk: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  avisoError: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  avisoText: { fontSize: 13, fontWeight: '600' },
  avisoTextOk: { color: '#047857' },
  avisoTextError: { color: '#B91C1C' },
  btnPrimary: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWarning: { backgroundColor: '#2563EB' },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  chipsContainer: { maxHeight: 44, marginBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: '#0F172A' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#475569' },
  chipTextSelected: { color: '#FFFFFF' },
  rowWrapper: { justifyContent: 'space-between' },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  itemCode: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  itemLocation: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  itemActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  btnEdit: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnEditText: { color: '#1D4ED8', fontSize: 12, fontWeight: '600' },
  btnDelete: { backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnDeleteText: { color: '#DC2626', fontSize: 12, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 30, width: '100%' },
  emptyText: { color: '#94A3B8', fontSize: 13 },
});