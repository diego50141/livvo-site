---
description: Cuenta las conversaciones (ventanas de 24 h) de un cliente de la oferta del 50 % para vigilar el tope de 500
argument-hint: "<nombre de la cuenta del cliente> <fecha de activación YYYY-MM-DD> [tope, por defecto 500]"
---

Cuenta cuántas conversaciones ha consumido un cliente de la oferta post-demo (50 % de descuento en el primer mes, tope de 500 conversaciones). Argumentos: $ARGUMENTS

## Antes de contar

1. Llama a `whoami` (herramientas `mcp__livvo__*`) y compara el nombre de la cuenta con el cliente indicado.
2. Si no coincide, **detente** y dilo: la llave conectada es de otra cuenta y contar con ella daría el uso equivocado. No cuentes ni mezcles datos de otra cuenta. Pide al usuario que conecte la llave de API del cliente.
3. La llave es de solo lectura (`contacts:read`, `conversations:read`, `messages:read`). Este comando no pausa a Luisa ni cambia nada en la cuenta.

## Qué es una conversación

Para esta oferta una conversación es una **ventana de 24 horas con un mismo contacto**, como la mide Meta. No es un hilo del CRM: un hilo puede durar semanas y abarcar muchas ventanas.

## Cómo contar

1. Pagina `list_conversations` (límite 100, siguiendo `next_cursor`) y quédate con las que tengan `last_message_at` igual o posterior a la fecha de activación.
2. Para cada una, pagina `list_messages` (vienen del más nuevo al más viejo) hasta pasar la fecha de activación, y descarta los mensajes anteriores a ella.
3. Ordena los mensajes de la conversación de más viejo a más nuevo. El primero abre una ventana que dura 24 horas. El siguiente mensaje posterior a esas 24 horas abre otra ventana. Repite hasta el final.
4. Suma las ventanas de todas las conversaciones.

El conteo es aproximado: no distingue si la ventana la abrió un mensaje del cliente o una plantilla del negocio, y tiende a contar un poco de más, no de menos. Dilo en el resultado.

## Qué entregar

- Total de ventanas desde la fecha de activación y su porcentaje frente al tope.
- Estado: **verde** por debajo de 400, **amarillo** entre 400 y 499 (avisar al cliente que se acerca al tope), **rojo** desde 500 (el tope se alcanzó: Luisa debe pausarse y hay que avisar al cliente).
- Desglose por día de los últimos 7 días, para ver el ritmo y estimar cuándo llegaría a 500.
- Cuántas conversaciones y mensajes revisaste, y si algo quedó incompleto (paginación cortada o errores).

No incluyas nombres, teléfonos ni texto de los mensajes de los contactos del cliente en el resultado: solo cifras.
