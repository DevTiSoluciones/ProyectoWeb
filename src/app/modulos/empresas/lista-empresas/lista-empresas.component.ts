import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';   
import { AuthService } from 'src/app/auth/services/auth.service';
import { LoginService } from 'src/app/auth/services/login.service';
import { InterfaceColumnasGrilla } from 'src/app/shared/interfaces/shared.interfaces';  
import { GeneralService } from 'src/app/shared/services/generales.services';
import { MensajesSwalService } from 'src/app/utilities/swal-Service/swal.service';
import { DataEmpresa, IEmpresa, IPedioCrate } from '../interface/empresa.interface';
import { EmpresaService, } from '../services/empresa.service';
import { PlanesService } from '../services/planes.services';

@Component({
  selector: 'app-lista-empresas',
  templateUrl: './lista-empresas.component.html'
})
export class ListaEmpresasComponent implements OnInit {
 
  VistaEditarEmpresa: boolean = false;
  VistaPlanes: boolean = false;
  VistaRoles: boolean = false;
  VistaUsuarios: boolean = false; 
  VistaListaPlanes: boolean = false;
 
  empresasAsociadas : IEmpresa[] = [];
  ColsEmpresa: InterfaceColumnasGrilla[] = [];
  itemsEmpresa! : MenuItem[];  
 // empresasSelect! : DataEmpresa; 
  tokenLS : any = ""; 
  empresasAcceder! : DataEmpresa; 
  mostrarHeader : boolean = true;
 

  constructor(
    private router : Router,
    private loginService : LoginService, 
    private empresaService: EmpresaService, 
    private swal: MensajesSwalService, 
    private planesService : PlanesService,
    private authService : AuthService,
    private generalService : GeneralService,
  ) {

   }
   
  ngOnInit(): void {    
    this.ColsEmpresa = [ 
      { field: 'ruc', header: 'Ruc', visibility: true }, 
      { field: 'razonSocial', header: 'Razón Social', visibility: true },  
      { field: 'acciones', header: 'Ajustes', visibility: true  }, 
    ];

    this.onItemsEmpresas();
    this.onLoadEmpresas(); 
  }

   

  onItemsEmpresas(){
    this.itemsEmpresa = [ 
      {
        label:'Roles',
        icon:'pi pi-fw pi-key', 
        command:()=>{
          this.onVistaRoles();
        }
      },
      {
        label:'Usuarios',
        icon:'pi pi-fw pi-users',
        command:()=>{
          this.onVistaUsuarios();
        }
      },
      {
        label:'Editar Empresa',
        icon:'pi pi-fw pi-pencil',
        command:()=>{
          this.onVistaEditar();
        }
      }, 
      {
        label:'Planes',
        icon:'pi pi-fw pi-clone',
        command:()=>{
          this.onVistaListaPlanes();
        }
    },
    ];
  }

  onSelectItems(data: DataEmpresa){   
   const DatoUsuarioEncryptado : any = {
    usuariologin: this.authService.cifrarData(data.razonSocial),
    rolUsuario : this.authService.cifrarData(data.rol)
  }

  sessionStorage.setItem('DatosUsuario', JSON.stringify(DatoUsuarioEncryptado));   
  }

  onLoadEmpresas(){
    this.swal.mensajePreloader(true);
    this.empresaService.empresasGet().subscribe((resp) =>{ 
      if(resp.length > 0){ 
        this.empresasAsociadas = resp;   
      }else{ 
        this.swal.mensajeRegistrarEmpresa()
        .then((response) => { 
          if (response.isConfirmed) { 
            this.router.navigate(['/modulos/empresas/agregar-empresa'])
          }
        });  
      } 
      this.swal.mensajePreloader(false);
    },error => { 
      this.generalService.onValidarOtraSesion(error);  
    });
  }
 
  onAcceder(empresa : DataEmpresa){  
    this.empresasAcceder = empresa  
    this.planesService.planesPorEmpresaGet(empresa.empresaGuid).subscribe((resp) => {
      if(resp.planId){   
        let gruiEncryptado = this.authService.cifrarData(empresa.empresaGuid)
        localStorage.setItem('guidEmpresa', gruiEncryptado )

        const DatoUsuarioEncryptado : any = {
          usuariologin: this.authService.cifrarData(empresa.razonSocial),
          rolUsuario : this.authService.cifrarData(empresa.rol)
        }

        sessionStorage.setItem('DatosUsuario', JSON.stringify(DatoUsuarioEncryptado));   
        this.router.navigate(["/modulos/home/landing"]) 
      }else{ 
        this.swal.mensajeElegirunPlan().then((response) => { 
          if (response.isConfirmed) { 
            this.onVistaPlanes();
          }
        });
      }
    }) 
  }

  onRegistrarEmpresa(){ 
    this.tokenLS  = null
    this.VistaEditarEmpresa = true;
  }

  onVistaListaPlanes(){
    this.tokenLS = localStorage.getItem('token');
    this.VistaListaPlanes = true;
  }

  //Vistas
  onVistaPlanes(){
    this.mostrarHeader =  this.mostrarHeader
    this.VistaPlanes = true;
  }

  onVistaEditar(){  
    this.tokenLS =  localStorage.getItem('token');
    this.VistaEditarEmpresa = true;
  }

  onVistaRoles(){ 
    this.tokenLS =  localStorage.getItem('token');
    this.VistaRoles = true;
  }

  onVistaUsuarios(){  
    this.tokenLS =  localStorage.getItem('token');
    this.VistaUsuarios = true;
  }
  //CerrarVistas
  onRetornar(event :any){
    if(event === 'exito'){
      this.onLoadEmpresas();
    }
    this.VistaEditarEmpresa = false;
    this.VistaPlanes = false;
    this.VistaRoles = false;
    this.VistaUsuarios = false;
    this.VistaListaPlanes = false;
  }

  

  onLogout(){
    this.loginService.logout();
    this.router.navigate(['/auth/login']);
  }
  
 
  onPlanelegido(event :any){
    if(event){
      const newPedido : IPedioCrate = {
        planesarticulosid: event.plan.planesarticulosid,
        cantidad: +event.cantidad,
        empresaguid: this.empresasAcceder.empresaGuid
      }
      this.planesService.registrarPedido(newPedido).subscribe((resp) => {
        if(resp){
          this.swal.mensajeExito('Se registro el pedido correctamente!.');
          this.VistaPlanes = false;
        }
      })
    }
  }

}
