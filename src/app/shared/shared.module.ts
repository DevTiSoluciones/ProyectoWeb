import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
 
import { PrimeNGModule } from '../utilities/PrimeNG/primeng.module';
import { AppBreadcrumbComponent } from './components/breadcrumb/app.breadcrumb.component'; 
import { AppConfigComponent } from './components/config/app.config.component';
import { AppFooterComponent } from './components/footer/app.footer.component';
import { AppMenuComponent } from './components/menu/app.menu.component';
import { AppMenuitemComponent } from './components/menuitem/app.menuitem.component';
import { AppTopBarComponent } from './components/topbar/app.topbar.component';  
 
@NgModule({
  declarations: [  
    AppBreadcrumbComponent, 
    AppConfigComponent,
    AppFooterComponent,
    AppMenuComponent,
    AppMenuitemComponent,
    AppTopBarComponent, 
  ],
  imports: [
    CommonModule, 
    PrimeNGModule,
  ],
  exports:[  
    AppBreadcrumbComponent, 
    AppConfigComponent,
    AppFooterComponent,
    AppMenuComponent,
    AppMenuitemComponent,
    AppTopBarComponent, 
  ]
})
export class SharedModule { }
