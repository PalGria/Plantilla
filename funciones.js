//DEFINO VARIABLES PARA EL JUEGO

//FIN DE DEFINICION
var dragItems = document.querySelectorAll('[draggable=true]');

//codigo de adaptacion a firefox (firefox solo permite algunos objetos draggables)
for (var i = 0; i < dragItems.length; i++) {
  addEvent(dragItems[i], 'dragstart', function (event) {
    // store the ID of the element, and collect it on the drop later on
    event.dataTransfer.setData('Text', this.id);
  });
}
//fin de codigo de adaptacion a firefox


function arranque_index()
{
	llamada_ajax_generico("GET","clasificacion");
}

//LLAMADAS AJAX
function ordenar_descentemente(metodo)
{
	nodo2=document.getElementById("clasificaciones");
	listadeelementos=nodo2.getElementsByTagName("tr");
	for (var p = 1;listadeelementos.length > p; p++) 
	{
		for (var t = 1;listadeelementos.length > t; t++) 
		{
			valor1="";
			valor2="";
			if(metodo == 1) //si se ordena por ganadas
			{
				valor1 = listadeelementos[t].getElementsByTagName("td")[1].innerHTML;
				if((t+1) < listadeelementos.length)
				{
					valor2 = listadeelementos[t+1].getElementsByTagName("td")[1].innerHTML;
				}
			}
			else if(metodo == 2) //si se ordena por victorias
			{
				valor1 = listadeelementos[t].getElementsByTagName("td")[3].innerHTML.replace("%","");
				if((t+1) < listadeelementos.length)
				{
					valor2 = listadeelementos[t+1].getElementsByTagName("td")[3].innerHTML.replace("%","");
				}
			}
			
			if(valor2 != "")
			{
				if(parseInt(valor1) < parseInt(valor2))
				{
					nodo2.insertBefore(listadeelementos[t+1],listadeelementos[t]);
					console.log("valor1 es menor que valor2 "+valor1+"--"+valor2);
				}
			}
		}
	}
}

function procesar_cambios_de_clasificacion()
{
	if(obj_ajax.readyState == 4)
	{ 
		// valor 4: respuesta recibida y lista para ser procesada
		if(obj_ajax.status == 200)
		{ 
			// El valor 200 significa que ha ido todo bien en la carga
			// Aquí se procesa lo que se haya devuelto:
			console.log("se ha terminado la carga de datos clasificacion -> devolviendo");//devolvemos mensaje por log
			clasificacion=JSON.parse(obj_ajax.responseText);//creamos el objeto datos con los datos parseados
			console.log("informacion devuelta:"+obj_ajax.responseText);//devolvemos por consola sus valores devueltos
			foormatear(clasificacion,"clasificacion");//mostramos la informacion en la pagina 
		}
		else 
		{
			console.warn("no se ha podido completar la peticion ajax-html de index-clasificacion");//devolvemos mensaje por log
			//zoom_activo();//activamos el slider sin opcion que significa que ha ido mal
		}
	}
}


function llamada_ajax_generico(tipo_de_llamada,a_donde)//tipo_de_llamada "POST" o "GET",a donde debe ser una ruta conocida y implementada en el codigo si no se hara una llamada generica a ese punto
{
	obj_ajax= crearObjAjax();//creamos la conexion ajax
	if(obj_ajax) //comprobamos que exista
	{ 
		parametros_extras="";
		url="";
		datos="";
		// Si se ha creado el objeto, se sigue ejecutando la peticion ...
		// Se establece la función (callback) a la que llamar cuando cambie el estado en este caso procesar_cambios que sera personalizado
		if(a_donde == "clasificacion")//funcionamiento correcto
		{
			obj_ajax.onreadystatechange= procesar_cambios_de_clasificacion; // función callback: procesarCambio para comentarios	
			url = "rest/clasificacion/";
			parametros_extras = "?c=10";
		}
		else if(a_donde == "logearse")
		{
			obj_ajax.onreadystatechange= entrando; // función callback: procesarCambio para comentarios	
			url = "rest/login/";
			use = document.getElementById("userlogin").value;
			pas = document.getElementById("password").value;
			datos = new FormData();
			datos.append("login",use);
			datos.append("pwd",pas);
		}
		else if(a_donde == "comprobacion_de_usuario")
		{
			obj_ajax.onreadystatechange= comprobaciondeusuario; // función callback: procesarCambio para comentarios	
			url = "rest/login/";
			use = document.getElementById("userregis").value;
			if(use.length <= 3)
			{
				return false;
			}
			parametros_extras=use;
		}
		else if(a_donde == "registrarse")
		{
			url = "rest/usuario/";
			obj_ajax.onreadystatechange = registrocomp;
			datos = new FormData();//formdata agrupa los datos segun clave/valor y los interpreta en el php como las variables de siempre [clave]
			usu = document.getElementById("userregis").value;
			pwd = document.getElementById("password").value;
			pw2 = document.getElementById("password2").value;
			nombre = document.getElementById("nombre_user").value;
			email = document.getElementById("email").value;
			foto =  document.querySelector('input[type=file]').files[0];
			datos.append("login",usu);//asi agregamos el valor y el nombre de la variable
			datos.append("pwd",pwd);
			datos.append("pwd2",pw2);
			datos.append("nombre",nombre);
			datos.append("email",email);
			if(foto != undefined)
			{
				datos.append("foto",foto);
			}			
		}
		else if(a_donde == "")
		{
			console.log("no se ha puesto a donde");
		}
		
		obj_ajax.open(tipo_de_llamada,url+parametros_extras, false); // Se crea petición GET a url, asíncrona ("true")
		obj_ajax.send(datos); // Se envía la petición	
	}
	else
	{
		console.warn('No existe "obj_ajax"');
	}
	
	return false;
}

function foormatear(datos,que_es)//"que_es" segun lo que sea se pone de una forma o otra
{
	if(que_es == "clasificacion")
	{
			nodo2=document.getElementById("clasificaciones");//nodo div de index
			fila=document.createElement("tr");
			fila.innerHTML = 
			'<th> Usuario:&nbsp;</th>'
			+'<th> Jugadas: <span onclick="ordenar_descentemente(1);">&dArr;</span>&nbsp;</th>'
			+'<th> Ganadas: &nbsp;</th>'
			+'<th> %Victorias: <span onclick="ordenar_descentemente(2);">&dArr;</span>&nbsp;</th>'
			+'<th> %Derrotas: &nbsp;</th>';
			nodo2.appendChild(fila);
			for (var t = datos.FILAS.length - 1; t >= 0; t--) 
			{
				login=datos.FILAS[t].LOGIN;
				jugadas=datos.FILAS[t].JUGADAS;
				ganadas=datos.FILAS[t].GANADAS;
				fila=document.createElement("tr");
				fila.innerHTML = 
				'<td id="'+login+'">'+login+'</td>'
				+'<td>'+jugadas+'</td>'
				+'<td>'+ganadas+'</td>'
				+'<td>'+((100/(parseInt(jugadas))*parseInt(ganadas))).toFixed(0)+'%</td>'
				+'<td>'+((100/(parseInt(jugadas))*(parseInt(jugadas)-parseInt(ganadas)))).toFixed(0)+'%</td>';
				nodo2.appendChild(fila);
			}
			ordenar_descentemente(1);
	}
	else if(que_es == "logearse")
	{
		sessionStorage.setItem("login_session",datos);//creamos los datos
		location.reload();
	}
	else if(que_es == "comprobacion_de_usuario")
	{
		if(datos.DISPONIBLE == "true")
		{
			document.getElementById("comprobacion").style.color="green";
			document.getElementById("comprobacion").innerHTML=" &#x02713;";
			return true;
		}
		else
		{
			document.getElementById("comprobacion").style.color="red";
			document.getElementById("comprobacion").innerHTML=" &#9932;";
			return false;
		}
	}
	else if(que_es == "registro")
	{
		mensaje = document.getElementById('mensaje');
		errorregistro = document.getElementById('errorregistro');
		if(datos.RESULTADO == "ok")
		{
			datos_alfa = JSON.stringify(datos);
			sessionStorage.setItem("login_session",datos_alfa);//creamos los datos
			mensaje.innerHTML="";
			mensaje.innerHTML="<div style='position: absolute;top: 50%; left: 50%;transform: translate(-50%, -50%);text-align:center;'><span>Su registro se ha realizado correctamente, presione el siguiente </span><a href='javascript:cerrar_juego()' style='padding-right:0;padding-left:0;'>enlace</a><span> para </span><a href='javascript:cerrar_juego()' style='padding-right:0;padding-left:0;'>Cerrar</a><span> la ventana</span><br/><span>Sera redireccionado despues de presionar el enlace al juego.</span>.</div>"
		}
		else
		{
			errorregistro.style.color = "red";
			errorregistro.innerHTML = " Ha ocurrido un error revise los datos.<br/>(todo menos la imagen debe tener la verificacion de que esta correcto -> &#x02713;)";
		}
	}
	else
	{
		console.log("no se sabe lo que es por lo que no se procesa la informacion");	
	}
}
function crearObjAjax()
{
	var xmlhttp;
	if(window.XMLHttpRequest) 
	{ 
		// Objeto nativo
		xmlhttp= new XMLHttpRequest(); // Se obtiene el nuevo objeto
		console.log("Detectado tipo de protocolo: estandar");
	} 
	else if(window.ActiveXObject) 
	{ 
		// IE(Windows): objectoActiveX
		xmlhttp= new ActiveXObject("Microsoft.XMLHTTP");
		console.log("Detectado tipo de protocolo: windows");
	}
	return xmlhttp;
}
//FIN DE LLAMADAS AJAX

//JUEGO CANVAS 4 EN RAYA

function getPosition(event)
{
	var x = new Number();
	var y = new Number();
	var canvas = document.getElementById("game");

	if (event.x != undefined && event.y != undefined)//esto se realiza en todos los navegadores menos en firefox
	{
	  x = event.x;
	  y = event.y;
	}
	else //metodo para firefox
	{
	  x = event.clientX + document.body.scrollLeft +
		  document.documentElement.scrollLeft;
	  y = event.clientY + document.body.scrollTop +
		  document.documentElement.scrollTop;
	}

	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
	
	xc=cv.clientWidth/cv.width;
	yc=cv.clientHeight/cv.height;
	
	x=x/xc;
	y=y/yc;
	
	var posiciones = new Array();
	posiciones["x"]=Math.floor(x/40);
	posiciones["y"]=Math.floor(y/40);
	
	return posiciones;
}

function posicionRaton(){
	var canvas = document.getElementById('game');
	canvas.addEventListener('click', pintar);

}


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev, tipo) {
    ev.dataTransfer.setData("text", ev.target.id);
}
function click(){
	alert("hago cosas ma bois");
}
function drop(ev){
	alert("Hago cosas ma bois");
}
//FIN DE JUEGO FICHAS