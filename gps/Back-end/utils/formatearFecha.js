export function formatDate(fechaInicial) {
    // Convertir a un objeto Date
    const fecha = new Date(fechaInicial);

    // Obtener componentes de la fecha
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes comienza en 0
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours() % 12 || 12).padStart(2, '0'); // Formato de 12 horas
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    const ampm = fecha.getHours() >= 12 ? 'PM' : 'AM';

    // Combinar en el formato deseado
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds} ${ampm}`;
}
export function utc(fechaColombia) {
    // Crear un objeto Date con la fecha en horario colombiano (UTC-5)
    const fechaLocal = new Date(fechaColombia);

    // Obtener la diferencia de la zona horaria local con UTC en minutos
    const diferenciaUTC = 5 * 60; // Colombia está en UTC-5

    // Ajustar la fecha al horario UTC
    const fechaUTC = new Date(fechaLocal.getTime() + diferenciaUTC * 60 * 1000);

    return fechaUTC.toISOString(); // Devuelve la fecha en formato ISO
}
