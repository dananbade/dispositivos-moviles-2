import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { clasificar, normalizar } from './modeloIA';

function dinero(valor) {
  return '$' + Number(valor).toLocaleString('es-CO') + ' COP';
}

function responderPrecio(equipo) {
  if (equipo?.precio == null || equipo.precio === '') {
    return 'Este equipo no tiene un precio registrado.';
  }
  if (equipo.precioTipo === 'estimado') {
    return `No hay un precio de compra confirmado. Como referencia, el valor estimado es ${dinero(equipo.precio)}.`;
  }
  return `Sí, tiene un precio registrado de ${dinero(equipo.precio)}.`;
}

function responderDescripcion(equipo) {
  const descripcion = equipo?.caracteristicas?.trim();
  if (!descripcion) return 'Este equipo no tiene una descripción ni características registradas.';
  if (/por confirmar|depende de la configuracion|no especificad/i.test(descripcion)) {
    return `La descripción disponible es orientativa; faltan especificaciones exactas por confirmar: ${descripcion}`;
  }
  return `La descripción del equipo es: ${descripcion}`;
}

function responderDato(equipo, intencion) {
  if (intencion === 'precio') return responderPrecio(equipo);
  if (intencion === 'caracteristicas') return responderDescripcion(equipo);
  if (intencion === 'nombre') return `El nombre del equipo es ${equipo.nombre} (código ${equipo.codigo}).`;
  if (intencion === 'ubicacion') {
    return equipo.ubicacion ? `La ubicación registrada es ${equipo.ubicacion}.` : 'No hay una ubicación registrada para este equipo.';
  }
  if (intencion === 'estado') {
    return equipo.estado ? `El estado registrado es ${equipo.estado.toLowerCase()}.` : 'Este equipo no tiene un estado registrado.';
  }
  if (intencion === 'responsable') {
    return equipo.responsable ? `El responsable registrado es ${equipo.responsable}.` : 'No hay un responsable asignado en el inventario.';
  }
  if (intencion === 'serie') {
    const serie = equipo.serie || equipo.numeroSerie;
    return serie ? `El número de serie registrado es ${serie}.` : 'No hay un número de serie registrado para este equipo.';
  }
  return 'Ese dato no está disponible en el inventario.';
}

function detectarConsultaNegada(pregunta) {
  const texto = normalizar(pregunta);
  const niegaConsulta = /\bno\s+(?:quiero|quisiera|deseo|necesito|me interesa)\b/.test(texto)
    && /\b(saber|consultar|conocer|ver|preguntar|mostrar|diga|digas)\b/.test(texto);
  if (!niegaConsulta) return null;
  const dato = texto.match(/\b(precio|costo|coste|valor|nombre|ubicacion|estado|descripcion|caracteristicas|responsable|serie)\b/);
  return dato?.[1] || 'ese dato';
}

function responderNegacionDeEstado(equipo, pregunta) {
  const texto = normalizar(pregunta);
  const coincidencia = texto.match(/\bno\s+(?:esta|se encuentra)\s+(operativo|operativa|en reparacion|dado de baja)\b/);
  if (!coincidencia) return null;
  const afirmacion = coincidencia[1];
  const estaEnLaCondicion = afirmacion === 'operativo' || afirmacion === 'operativa'
    ? equipo.estado === 'Operativo'
    : afirmacion === 'en reparacion'
      ? equipo.estado === 'En reparación'
      : equipo.estado === 'Dado de baja';
  const condicion = afirmacion === 'operativo' || afirmacion === 'operativa' ? 'operativo' : afirmacion;
  return !estaEnLaCondicion
    ? `Sí: en el inventario figura como ${equipo.estado.toLowerCase()}, así que no está ${condicion}.`
    : `No: en el inventario figura como ${equipo.estado.toLowerCase()}, por eso sí está ${condicion}.`;
}

export default function AsistenteIA({ equipos = [] }) {
  const [pregunta, setPregunta] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [indice, setIndice] = useState(0);
  const { width } = useWindowDimensions();
  const equipo = equipos[indice % Math.max(equipos.length, 1)];
  const formularioEnFila = width >= 700;

  function consultar() {
    if (!pregunta.trim()) {
      setRespuesta('Escribe una pregunta para consultar el inventario.');
      return;
    }
    if (!equipo) {
      setRespuesta('No hay equipos disponibles en el inventario.');
      return;
    }

    const datoNegado = detectarConsultaNegada(pregunta);
    if (datoNegado) {
      console.warn(`[Asistente] Posible consulta negada por el usuario: ${datoNegado}.`);
      setRespuesta(`Entendido: no consultaré ${datoNegado}. Si querías buscar otro dato, dime cuál. No cambié ni eliminé información del inventario.`);
      return;
    }

    const resultado = clasificar(pregunta);
    const intenciones = resultado.intenciones || (resultado.intencion ? [resultado.intencion] : []);
    const respuestaNegativa = responderNegacionDeEstado(equipo, pregunta);
    if (respuestaNegativa) {
      setRespuesta(respuestaNegativa);
      return;
    }

    if (!intenciones.length) {
      setRespuesta('Esa pregunta está fuera de lo que puedo consultar. Puedo ayudarte con los datos del equipo: nombre, ubicación, estado, precio o descripción.');
      return;
    }

    if (resultado.ambigua) {
      const opciones = intenciones.map((intencion) => intencion === 'caracteristicas' ? 'descripción' : intencion).join(' o ');
      setRespuesta(`No estoy seguro de cuál dato buscas. ¿Quieres consultar ${opciones}?`);
      return;
    }

    const respuestas = intenciones.map((intencion) => responderDato(equipo, intencion));
    setRespuesta(respuestas.length === 1
      ? respuestas[0]
      : `Sobre ${equipo.nombre}:\n${respuestas.join('\n')}`);
  }

  function seleccionarSiguiente() {
    setIndice((valorActual) => valorActual + 1);
    setRespuesta('');
  }

  return (
    <ScrollView
      testID="asistente-ia"
      style={[styles.pantalla, Platform.OS === 'web' && styles.pantallaWeb]}
      contentContainerStyle={styles.contenido}
      nestedScrollEnabled
      scrollEventThrottle={16}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.encabezado}>
        <Text style={styles.titulo} accessibilityRole="header">Asistente del inventario</Text>
        <Text style={styles.introduccion}>
          Consulta los datos del equipo seleccionado. Te indicaré cuando algo no esté registrado o sea solo una estimación.
        </Text>
      </View>

      <View style={styles.equipoCard}>
        <Text style={styles.etiquetaEquipo}>Equipo seleccionado</Text>
        <Text testID="equipo-seleccionado" style={styles.nombreEquipo}>
          {equipo?.nombre ?? 'No hay equipos disponibles'}
        </Text>
        <Text style={styles.codigoEquipo}>{equipo?.codigo ?? 'Sin código'}</Text>
        {equipo ? (
          <View style={styles.datosEquipo}>
            <Text style={styles.datoEquipo}>Precio {equipo.precioTipo === 'estimado' ? 'estimado' : 'registrado'}: {equipo.precio == null ? 'No registrado' : dinero(equipo.precio)}</Text>
            <Text style={styles.datoEquipo}>Descripción: {equipo.caracteristicas?.trim() || 'No registrada'}</Text>
          </View>
        ) : null}
        <Pressable
          testID="siguiente-equipo"
          accessibilityRole="button"
          accessibilityLabel="Seleccionar el siguiente equipo"
          style={({ pressed }) => [styles.botonSecundario, pressed && styles.botonPresionado]}
          onPress={seleccionarSiguiente}
          disabled={!equipos.length}
        >
          <Text style={styles.textoBotonSecundario}>Siguiente equipo</Text>
        </Pressable>
      </View>

      <View style={styles.consultaCard}>
        <Text style={styles.preguntaLabel}>Pregunta por el equipo seleccionado</Text>
        <View style={[styles.formulario, formularioEnFila && styles.formularioFila]}>
          <TextInput
            testID="pregunta-ia"
            value={pregunta}
            onChangeText={(texto) => { setPregunta(texto); setRespuesta(''); }}
            onSubmitEditing={consultar}
            placeholder="Ej.: ¿Cuál es su costo? ¿Qué descripción tiene?"
            placeholderTextColor="#64748B"
            accessibilityLabel="Pregunta sobre el equipo seleccionado"
            autoCapitalize="sentences"
            autoCorrect
            returnKeyType="send"
            style={styles.entrada}
          />
          <Pressable
            testID="consultar-ia"
            accessibilityRole="button"
            accessibilityLabel="Consultar al asistente"
            style={({ pressed }) => [styles.botonPrincipal, formularioEnFila && styles.botonEnFila, pressed && styles.botonPresionado]}
            onPress={consultar}
          >
            <Text style={styles.textoBotonPrincipal}>Consultar</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.resultadoCard} accessibilityRole="alert" accessibilityLiveRegion="polite">
        <Text style={styles.resultadoTitulo}>Respuesta</Text>
        <Text testID="resultado-ia" style={styles.resultadoTexto}>
          {respuesta || 'Escribe una pregunta sobre este equipo.'}
        </Text>
      </View>
      <Text style={styles.nota}>
        Las respuestas usan los datos guardados. Un precio estimado no equivale al costo de compra confirmado.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, minHeight: 0, backgroundColor: '#F8FAFC' },
  pantallaWeb: { overflowY: 'auto', overscrollBehaviorY: 'contain', touchAction: 'pan-y' },
  contenido: { width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, paddingBottom: 32, gap: 16 },
  encabezado: { gap: 6 },
  titulo: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  introduccion: { color: '#475569', fontSize: 14, lineHeight: 21 },
  equipoCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, padding: 16, gap: 6 },
  etiquetaEquipo: { color: '#64748B', fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  nombreEquipo: { color: '#0F172A', fontSize: 19, fontWeight: '800' },
  codigoEquipo: { color: '#475569', fontSize: 13, marginBottom: 4 },
  datosEquipo: { gap: 5, marginBottom: 8 },
  datoEquipo: { color: '#334155', fontSize: 13, lineHeight: 19 },
  consultaCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, padding: 16, gap: 10 },
  preguntaLabel: { color: '#1E293B', fontSize: 14, fontWeight: '700' },
  formulario: { gap: 10 },
  formularioFila: { flexDirection: 'row', alignItems: 'center' },
  entrada: { flex: 1, minWidth: 0, minHeight: 48, borderWidth: 1, borderColor: '#64748B', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#FFFFFF', color: '#0F172A', fontSize: 15 },
  botonPrincipal: { minHeight: 48, borderRadius: 9, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F766E' },
  botonEnFila: { alignSelf: 'stretch' },
  textoBotonPrincipal: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  botonSecundario: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#0F766E', paddingHorizontal: 14, marginTop: 2 },
  textoBotonSecundario: { color: '#0F766E', fontSize: 13, fontWeight: '700' },
  botonPresionado: { opacity: 0.72 },
  resultadoCard: { borderRadius: 12, padding: 16, backgroundColor: '#E0F2FE', gap: 6 },
  resultadoTitulo: { color: '#0C4A6E', fontSize: 13, fontWeight: '800' },
  resultadoTexto: { color: '#0C4A6E', fontSize: 16, lineHeight: 24 },
  nota: { color: '#64748B', fontSize: 12, lineHeight: 18 },
});