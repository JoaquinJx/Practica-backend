import { ArgumentsHost } from "@nestjs/common";
import { AuthExceptionFilter } from "../auth-exception.filter"
import { HttpException } from "@nestjs/common/exceptions/http.exception";


describe('AuthExceptionFilter', ()=>{
    let filter:AuthExceptionFilter;
    let mockArgumentsHost:ArgumentsHost;
    let mockResponse:any;
    let mockRequest:any;
    let mockUnauthorizedException: HttpException;
    let mockForbiddenException: HttpException;

    beforeEach(()=>{
        mockResponse ={
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        mockRequest={
            method:'GET',
            url:'/test/endpoint'
        }
        mockArgumentsHost ={
            switchToHttp: jest.fn().mockReturnValue({
                getResponse: () => mockResponse,
                getRequest: () => mockRequest
            })
        } as unknown as ArgumentsHost;
        
        mockUnauthorizedException ={
            getStatus:()=>401,
            message:'Unauthorized',
            getResponse:()=> 'Unauthorized'
        } as HttpException;

        mockForbiddenException ={
            getStatus: ()=>403,
            message:'Forbidden',
            getResponse:()=> 'Forbidden'
        } as HttpException;

        filter = new AuthExceptionFilter();
        
        // Limpiar mocks entre tests
        jest.clearAllMocks();
    })

    it('should be defined ',()=>{
        expect(filter).toBeDefined();
    });
    
    it('should catch UnauthorizedException and return custom format',()=>{
        filter.catch(mockUnauthorizedException, mockArgumentsHost);
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            statusCode: 401,
            timestamp: expect.any(String),
            path:'/test/endpoint',
            method:'GET',
            message:'Unauthorized',
            error:'Unauthorized'
        })
    })

    it('should catch ForbiddenException and return custom format',()=>{
        filter.catch(mockForbiddenException,mockArgumentsHost)
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenLastCalledWith({

             statusCode: 403,
            timestamp: expect.any(String),
            path:'/test/endpoint',
            method:'GET',
            message:'Forbidden',
            error:'Forbidden'
        })
    })

    it('should include valid timestamp in response',()=>{
        filter.catch(mockUnauthorizedException, mockArgumentsHost);

        const allArgs= mockResponse.json.mock.calls[0][0];
        expect(allArgs.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    })

})