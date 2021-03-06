import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Subject } from 'rxjs';
import { ICombo } from 'src/app/shared/interfaces/generales.interfaces';
import { GeneralService } from 'src/app/shared/services/generales.services';
import { MensajesSwalService } from 'src/app/utilities/swal-Service/swal.service';
import { ICrearCliente } from '../interface/clientes.interface';
import { ClienteService } from '../servicio/clientes.service';

@Component({
  selector: 'app-nuevo-cliente',
  templateUrl: './nuevo-cliente.component.html',
  styleUrls: ['./nuevo-cliente.component.scss']
})
export class NuevoClienteComponent implements OnInit {


  public FlgLlenaronCombo: Subject<boolean> = new Subject<boolean>();
  @Input() dataCliente! : any;
  @Output() cerrar : EventEmitter<any> = new EventEmitter<any>();
  Form : FormGroup;
  ClienteEdit : ICrearCliente;
 
  tituloNuevoCliente : string ="NUEVO CLIENTE";
  modalBuscarUbigeo : boolean = false;
  mostrarRazonSocial: boolean = false;
  ubigeoSeleccionado : number = 0;
  ubigeoParaMostrar : string ="";
  minimoRequerido : number = 0;
  maximoRequerido : number = 0;
  arraytipoPersona : ICombo[];
  arraytipoDocumento : ICombo[];

  constructor(
    private swal : MensajesSwalService, 
    private clienteService : ClienteService,
    private generalService : GeneralService
  ) {  
     this.builform();
    }

public builform(): void {
 this.Form = new FormGroup({ 
   tipoPersona: new FormControl(null, Validators.required), 
   tipoDocumento: new FormControl(null, Validators.required), 
   nroDocumento: new FormControl(null, Validators.required), 
   apellidos: new FormControl(null, Validators.required),  
   nombres: new FormControl(null, Validators.required),  
   razonSocial: new FormControl(null), 
   email: new FormControl(null), 
   telefonos: new FormControl(null), 
   website: new FormControl(null),  
   contacto: new FormControl(null),  
   autorizadoparalinea: new FormControl(false, Validators.required),  
   direccionprincipal: new FormControl(null), 
 })
}
 
ngOnInit(): void {
  this.onCargarDropdown();

  if(this.dataCliente){
    this.Avisar();
    this.tituloNuevoCliente ="EDITAR CLIENTE"; 
  }
}
  
  onCargarDropdown(){
    const obsDatos = forkJoin(   
      this.generalService.listadoPorGrupo('TipoPersona'), 
      this.generalService.listadoPorGrupo('TipoDocumento'), 
    );
    obsDatos.subscribe((response) => { 
      this.arraytipoPersona = response[0];   
      this.arraytipoDocumento = response[1];   
      this.FlgLlenaronCombo.next(true); 
    },error => { 
      this.generalService.onValidarOtraSesion(error);  
    });
  }
 
  Avisar(){
    this.FlgLlenaronCombo.subscribe((x) => {
      this.onObtenerClientePorId(); 
    });
  }

  onObtenerClientePorId(){
    this.swal.mensajePreloader(true); 
    this.clienteService.clientePorId(this.dataCliente.idCliente).subscribe((resp) => {
      if(resp){ 
        this.ClienteEdit = resp;
        this.onObtenerTipoDocumento(this.ClienteEdit.personaData.tipodocumentoid);
        this.generalService.listarubigeo(resp.personaData.ubigeoprincipal).subscribe((ubi)=> {
          let datosubi: any = Object.values(ubi) 
          this.ubigeoParaMostrar = datosubi[0] + ' - ' +  datosubi[1] + ' - ' + datosubi[2];
        })
        this.ubigeoSeleccionado = resp.personaData.ubigeoprincipal;

        this.Form.patchValue({
            tipoPersona: this.arraytipoPersona.find(
            (x) => x.id === this.ClienteEdit.personaData.tipopersonaid
            ),
            tipoDocumento: this.arraytipoDocumento.find(
              (x) => x.id === this.ClienteEdit.personaData.tipodocumentoid
            ), 
            nroDocumento: this.ClienteEdit.personaData.nrodocumentoidentidad,
            apellidos: this.ClienteEdit.personaData.apellidos,
            nombres: this.ClienteEdit.personaData.nombres,
            razonSocial: this.ClienteEdit.personaData.razonsocial,
            email: this.ClienteEdit.emails,
            telefonos: this.ClienteEdit.telefonos,
            website: this.ClienteEdit.website,
            contacto: this.ClienteEdit.nombrecontacto,
            autorizadoparalinea: this.ClienteEdit.autorizadoparalineacredito,
            direccionprincipal: this.ClienteEdit.personaData.direccionprincipal
          })
        }
        this.swal.mensajePreloader(false);
    },error => { 
      this.generalService.onValidarOtraSesion(error);  
    });
  }
  
  onObtenerTipoDocumento(event : any){
    let evento = this.arraytipoDocumento.filter(x => x.id === event) 
    let hizoclick = event.valor1
    if(hizoclick){
      this.limpiarForm();
      this.onValidacionRequired(hizoclick);
    }else{
      this.onValidacionRequired(evento[0].valor1);
    } 
  }

  onValidacionRequired(event : any){  
    const apellidos = this.Form.get("apellidos");
    const nombres = this.Form.get("nombres");
    const razonSocial = this.Form.get("razonSocial"); 
     
    if (event === 'DNI') { 
      apellidos.setValidators([Validators.required]);
      nombres.setValidators([Validators.required]); 
      razonSocial.setValidators(null);  
      this.mostrarRazonSocial = false;
      this.minimoRequerido = 8;
      this.maximoRequerido = 8;
    } else{ 
      apellidos.setValidators(null);
      nombres.setValidators(null); 
      razonSocial.setValidators([Validators.required]);  
      this.mostrarRazonSocial = true;
      this.minimoRequerido = 11;
      this.maximoRequerido = 15;
    }

    apellidos.updateValueAndValidity();
    nombres.updateValueAndValidity();
    razonSocial.updateValueAndValidity();  
 
  }



  limpiarForm(){
    this.Form.controls['nroDocumento'].setValue('');
    this.Form.controls['apellidos'].setValue('');
    this.Form.controls['nombres'].setValue('');
    this.Form.controls['razonSocial'].setValue(''); 
    this.Form.controls['email'].setValue('');
    this.Form.controls['telefonos'].setValue('');
    this.Form.controls['website'].setValue('');
    this.Form.controls['contacto'].setValue('');
    this.ubigeoSeleccionado = null,
    this.ubigeoParaMostrar = "";
  }

 
  onBuscarPorDocumento(){ 
    const tipoDocumento  = this.Form.controls['tipoDocumento'].value;
    const nroDocumento  = this.Form.controls['nroDocumento'].value;
    if(!tipoDocumento){
      this.swal.mensajeAdvertencia('seleccione un tipo de documento');
      return;
    }

    if(!nroDocumento){
      this.swal.mensajeAdvertencia('porfavor ingrese un numero de documento');
      return;
    } 

    if(tipoDocumento.valor1 === 'DNI'){ 
      if(nroDocumento.toString().length === 8){
        this.swal.mensajePreloader(true)
        this.generalService.consultaPorDni(nroDocumento).subscribe((resp) => {
          if(resp.dni){
            this.Form.patchValue({
              apellidos : resp.apePaterno + ' ' + resp.apeMaterno,
              nombres : resp.nombres
            });
            this.swal.mensajePreloader(false)
          }else{
            this.swal.mensajeError('No se encontraron datos.');
            this.limpiarForm();
            return;
          }
        },error => {
          this.swal.mensajeError(error.error.errors.dni[0]); 
        })
      }else{
        this.swal.mensajeAdvertencia('porfavor ingrese un numero de documento valido');
      }
    }else if(tipoDocumento.valor1 === 'RUC'){
      if(nroDocumento.toString().length === 11){
        this.swal.mensajePreloader(true)
        this.generalService.consultarPorRuc(nroDocumento).subscribe((resp) => {
          if(resp){  
            this.Form.patchValue({
              razonSocial : resp.Data.razonsocial,
              direccionprincipal : resp.Data.DireccionCompleta, 
            });
            this.ubigeoParaMostrar =  resp.Data.UbigeoDescripcion,
            this.ubigeoSeleccionado = resp.Data.ubigeo
            this.swal.mensajePreloader(false)
          } 
         
        },error => {
          this.swal.mensajeError(error.error.errors.ruc);
        })
      }else{
        this.swal.mensajeAdvertencia('porfavor ingrese un numero de ruc valido');
      }
    } 

  }


  onBuscarUbigeo(){
    this.modalBuscarUbigeo = true;
  }

  onPintarUbigeoSeleccionado( data : any){ 
    if(data){
      this.ubigeoParaMostrar = data.nombreubigeo;
      this.ubigeoSeleccionado = data.ubigeo; 
    }
    this.modalBuscarUbigeo = false;
  }



  onGrabar(){
    const data = this.Form.value;
  
    const newCliente : ICrearCliente = {

    autorizadoparalineacredito : data.autorizadoparalinea,
    codigocliente :  this.ClienteEdit ? this.ClienteEdit.codigocliente : null,
    emails : data.email,
    grupoclientesid :  this.ClienteEdit ? this.ClienteEdit.grupoclientesid : 0,
    idcliente : this.ClienteEdit ? this.ClienteEdit.idcliente : 0,
    nombrecontacto : data.contacto,
    personaData : {
      apellidos : data.apellidos,
      direccionprincipal : data.direccionprincipal,
      nombres: data.nombres,
      nrodocumentoidentidad : data.nroDocumento,
      personaid : this.ClienteEdit ? this.ClienteEdit.personaid : 0,
      razonsocial : data.razonSocial,
      categoriapersona : this.ClienteEdit ? this.ClienteEdit.personaData.categoriapersona : 0,
      tipodocumentoid: data.tipoDocumento.id ? data.tipoDocumento.id : 0,
      tipopersonaid : data.tipoPersona.id ? data.tipoPersona.id : 0,
      ubigeoprincipal : this.ubigeoSeleccionado,
    },
    personaid : this.ClienteEdit ? this.ClienteEdit.personaData.personaid : 0,
    telefonos : data.telefonos,
    tipoclienteid: this.ClienteEdit ? this.ClienteEdit.tipoclienteid : 0,
    website : data.website,
    espublicogeneral : this.ClienteEdit ? this.ClienteEdit.espublicogeneral : false,
    fechanacimiento : this.ClienteEdit ? this.ClienteEdit.fechanacimiento : null ,
    idauditoria : this.ClienteEdit ? this.ClienteEdit.idauditoria : 0 ,
 
    }

   

    if(!this.ClienteEdit){
      this.clienteService.crearCliente(newCliente).subscribe((resp) => {
        if(resp){
          this.onVolver();
        }
        this.swal.mensajeExito('Se grabaron los datos correctamente!.');
      },error => { 
        this.generalService.onValidarOtraSesion(error);  
      });
    }else{
      this.clienteService.updateCliente(newCliente).subscribe((resp) => {
        if(resp){
          this.onVolver();
        }
        this.swal.mensajeExito('Se actualizaron los datos correctamente!.');
      },error => { 
        this.generalService.onValidarOtraSesion(error);  
      });
    }  
  }

  onVolver(){
    this.cerrar.emit('exito')
  }

  onRegresar(){
    this.cerrar.emit(false)
  }


}
