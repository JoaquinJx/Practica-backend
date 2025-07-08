//ESTA ES LA ENTIDAD DE UN CONTACTO ASI DE TAL MANERA SE GUARDA EN LA BASE DE DATOS 
//Los apartados que tienen como resultado una clase es porque se desenvuelven como por
//ejemplo los detalles del contacto, el tipo de contacto segun, el tipo de delivery
interface Contact{
    readonly id:string;
    name?:string;
    lastName?:string;
    jobPosition?:string | null;
    contactDetailsId?:string;
    insuranceId?:string | null;
    addressId?:string;
    contactDetails?:ContactDetails;
    products?:{
        id:string;
        name: string;
        isActive:boolean;
        designation:ContactType | string;  
        //deliveyType:DeliveryType| string; //TODO QUEDA PENDIENTE es entidad de otro modulo*/
        tags:{name:string}[];
    }[]
   // insurance?:Insurance | null;//TODO QUEDA PENDIENTE es entidad de otro modulo
    quote?: any[];
    isActive?:boolean;
    isDeleted?:boolean;
    readonly updateAt?:Date;
    readonly createAt?:Date;

}

//ESTOS SON LOS DETALLES DEL CONTACTO ContactDetails
//La interrogacion despues de la propiedad significa que puede estar o no, es decir lo comprueba.

interface ContactDetails {
    readonly id?:string;
    email?: string;
    mobile?: string | null;
    phone?: string | null;
   // user?: User; //TODO PENDIENTE
    contact?:Contact;
    //insurance?:Insurance; //TODO Pendiente
   // client?:Client; //TODO PENDIENTE
    isActive?:boolean;
    isDeleted?:boolean;
}
//EL TIPO DE CONTACTO
enum ContactType{
    PRINCIPAL='PRINCIPAL',
    ALTERNATIVE='ALTERNATIVE'
}
//PARA CREAR LOS DETALLES DE UN CONTACTO 
interface CreateContactDetailsInput{
email?:string;
vatNumber?:string;
dni?: string;
mobile?:string;
phone?:string;
userId?:string;
contactId?:string
insuranceId?:string;
organizationId?:string;
}
//PARA ACTUALIZAR LOS DETALLES DE UN CONTACTO

interface updateContactDetailsInput{
    email?:string;
    mobile?:string;
    phone?:string;
}