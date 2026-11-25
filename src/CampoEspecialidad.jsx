import { useEffect, useRef, useState } from "react";
import { normalizarEspecialidad } from "./especialidades.js";

const ID_LISTA = "opciones-especialidad";

export default function CampoEspecialidad({
  catalogo, valor, seleccionValida, onChange, deshabilitado, invalido, descripcion, placeholder,
}) {
  const [abierto, setAbierto] = useState(false);
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [activa, setActiva] = useState(-1);
  const entrada = useRef(null);
  const opcionActiva = useRef(null);

  const visible = abierto && !deshabilitado;
  const busqueda = normalizarEspecialidad(valor);
  const coincidencias = catalogo.filter((opcion) => normalizarEspecialidad(opcion).includes(busqueda));
  const opciones = mostrarTodas ? catalogo : coincidencias;

  useEffect(() => {
    if (visible && activa >= 0) {
      opcionActiva.current?.scrollIntoView({ block: "nearest" });
    }
  }, [visible, activa]);

  function abrir() {
    setMostrarTodas(Boolean(seleccionValida));
    setActiva(-1);
    setAbierto(true);
  }

  function cerrar() {
    setAbierto(false);
    setActiva(-1);
  }

  function seleccionar(opcion) {
    onChange(opcion);
    cerrar();
  }

  // Las flechas recorren las sugerencias sin mover el foco fuera del campo.
  function manejarTecla(evento) {
    if (evento.nativeEvent.isComposing) return;

    if (evento.key === "Escape" && visible) {
      evento.preventDefault();
      cerrar();
    }

    if (evento.key === "Enter" && visible) {
      if (opciones[activa]) {
        evento.preventDefault();
        seleccionar(opciones[activa]);
      } else {
        cerrar();
      }
      return;
    }

    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      const haciaAbajo = evento.key === "ArrowDown";
      if (!visible) {
        abrir();
        const total = seleccionValida ? catalogo.length : coincidencias.length;
        if (total > 0) setActiva(haciaAbajo ? 0 : total - 1);
      } else if (opciones.length > 0) {
        if (activa < 0) setActiva(haciaAbajo ? 0 : opciones.length - 1);
        else setActiva(haciaAbajo ? Math.min(activa + 1, opciones.length - 1) : Math.max(activa - 1, 0));
      }
    }
  }

  return (
    <div className="especialidad-control">
      <input
        id="especialidad"
        ref={entrada}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={visible}
        aria-controls={ID_LISTA}
        aria-activedescendant={visible && opciones[activa] ? `${ID_LISTA}-${activa}` : undefined}
        aria-invalid={invalido}
        aria-describedby={descripcion}
        placeholder={placeholder}
        value={valor}
        disabled={deshabilitado}
        onFocus={abrir}
        onClick={() => { if (!visible) abrir(); }}
        onBlur={cerrar}
        onKeyDown={manejarTecla}
        onChange={(evento) => {
          onChange(evento.target.value);
          setMostrarTodas(false);
          setActiva(-1);
          setAbierto(true);
        }}
      />
      <button
        className="especialidad-flecha"
        type="button"
        tabIndex={-1}
        aria-label={visible ? "Ocultar especialidades" : "Mostrar especialidades"}
        disabled={deshabilitado}
        onMouseDown={(evento) => evento.preventDefault()}
        onClick={() => {
          entrada.current?.focus();
          if (visible) cerrar();
          else abrir();
        }}
      />
      <div className="especialidad-menu" hidden={!visible}>
        {visible && opciones.length === 0 && (
          <p role="status">No hay especialidades que coincidan.</p>
        )}
        <ul id={ID_LISTA} role="listbox" aria-label="Especialidades disponibles">
          {visible && opciones.map((opcion, indice) => (
            <li
              key={opcion}
              id={`${ID_LISTA}-${indice}`}
              ref={indice === activa ? opcionActiva : null}
              role="option"
              aria-selected={indice === activa}
              onMouseDown={(evento) => evento.preventDefault()}
              onClick={() => seleccionar(opcion)}
            >
              {opcion}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
